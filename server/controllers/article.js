const express = require('express')
const app = require('../server.js')
const db = require('../models/db2')
const fs = require('fs')
const path = require('path')
const cuid = require('cuid')
const util = require('../models/utils')

// 路由对象
const router = express.Router()
router.prefix = '/article'

// 暴露路由模块
module.exports = router

/**
 * GET /article/getlist
 */
router.get('/getlist', (req, res) => {
    // console.log(req.query)
    let sqlStr = ``
    // 根绝分类ID查询
    if (Number(req.query.cid) !== 0){
        sqlStr += db.format(` AND t1.cid=?`, [req.query.cid])
    }
    // 根据标题查询
    if (req.query.input !== ''){
        sqlStr += db.format(` AND t1.title LIKE ?`, [`%${req.query.input}%`])
    }

    const entitys = []

    // 分页sql
    const pagination = {
        sql: `
            SELECT
                t1.id, t1.cid, t1.title, t1.sort, t2.name author, t1.modify_time time
            FROM
                article t1
            LEFT JOIN
                user t2
            ON
                t1.creator=t2.id
            WHERE
                t1.deleted='0'
                ${sqlStr}
            ORDER BY
                t1.sort DESC
                ${util.generatePageSql(req.query.pageNum, req.query.pageSize)}
        `,
        params: []
    }

    // 获取总数sql
    const total = {
        sql: `
            SELECT
                count(*) total
            FROM
                article t1
            WHERE
                t1.deleted='0'
            ${sqlStr}
        `,
        params: []
    }

    entitys.push(pagination)
    entitys.push(total)

    // 执行 sql
    db.query(entitys, rows => {
        const pageSize = req.query.pageSize > 0 ? Number(req.query.pageSize) : 10
        return res.json({
            err: 1,
            message: '',
            info: rows[0],
            totalRow: rows[1][0].total,
            totalPage: Math.ceil(rows[1][0].total / pageSize)
        })
    })
})

/**
 * GET /article/save
 */
router.post('/save', (req, res) => {
    // 文章内容外键ID
    const content_id = cuid()
    // 文件路径
    const file_path  = !!req.body.imgPath ? path.join(app.get('articlepath'), util.getFileName(req.body.imgPath)) : ''
    
    if (file_path != ''){
        // 判断文件夹是否存在，false -> create
        if (!fs.existsSync(app.get('articlepath'))){
            fs.mkdirSync(app.get('articlepath'))
        }
        //文件重命名 -> 移动文件
        fs.renameSync(path.join(app.get('admin_root'), req.body.imgPath), file_path)
    }

    db.query(`select max(t1.sort) maxsort from article t1`, [], rows => {
        let maxSort = !rows[0].maxsort ? 0 : Number.parseInt(rows[0].maxsort)
        let sqlEntities = []
        const entity1 = {
            sql: `insert into article values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
                cuid(),
                req.body.cid,
                req.body.title,
                req.body.desc,
                content_id,
                req.body.imgPath.replace('temp', 'article'),
                req.body.sort || maxSort + 10,
                util.createTime(),
                req.body.time || util.createTime(),
                req.session.userid,
                '0'
            ]
        }
        const entity2 = {
            sql: `insert into content values (?, ?)`,
            params: [content_id, req.body.content]
        }
        sqlEntities.push(entity1)
        sqlEntities.push(entity2)

        // 事物回滚
        db.executeTransaction(sqlEntities, (err, rows) => {
            if (!err){
                return res.json({
                    err: 1,
                    message: '文章添加成功!'
                })
            } else {
                return res.json({
                    err: 0,
                    message: '文章添加失败!'
                })
            }
        })
    })
})

/**
 * GET /article/getone
 */
router.get('/getone', (req, res) => {
    db.query(`
        select
            t1.id, t1.cid, t1.title, t1.desc, t2.content, t1.img_path, t3.img_size, t1.sort, t1.modify_time time
        from
            article t1
        left join
            content t2
        on
            t1.content_id=t2.id
        left join
            classify t3
        on
            t1.cid=t3.id
        where
            t1.id=?
    `, [req.query.id], rows => {
        // 处理图片 URL
        rows.forEach(item => item.img_url = `http://${req.headers.host}${item.img_path}`)
        return res.json({
            err: 1,
            message: '',
            info: rows[0]
        })
    })
})

/**
 * GET /article/update
 */
router.post('/update', (req, res) => {
    if (req.body.imgPath != '' && req.body.imgPath.search('temp') != -1){
        let file_path = path.join(app.get('articlepath'), util.getFileName(req.body.imgPath))
        //文件重命名 -> 移动文件
        fs.renameSync(path.join(app.get('admin_root'), req.body.imgPath), file_path)
    }

    let sqlEntities = []
    const entity1 = {
        sql: `update article t1 set t1.cid=?, t1.title=?, t1.desc=?, t1.img_path=?, t1.sort=?, t1.modify_time=? where t1.id=?`,
        params: [
            req.body.cid,
            req.body.title,
            req.body.desc,
            req.body.imgPath.replace('temp', 'article'),
            req.body.sort,
            req.body.time,
            req.body.id
        ]
    }
    const entity2 = {
        sql: `update content t1 set t1.content=? where t1.id=(select content_id from article where id=?)`,
        params: [req.body.content, req.body.id]
    }
    sqlEntities.push(entity1)
    sqlEntities.push(entity2)

    // 事物回滚
    db.executeTransaction(sqlEntities, (err, rows) => {
        if (!err){
            return res.json({
                err: 1,
                message: '更新文章成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '更新文章失败.'
            })
        }
    })
})

/**
 * GET /article/delete
 */
router.get('/delete', (req, res) => {
    const ids = req.query.id.split(',')

    let sqlEntities = []
    const entity1 = {
        sql: `delete from content where id in (select content_id from article where id in (?))`,
        params: [ids]
    }
    const entity2 = {
        sql: `delete from article where id in (?)`,
        params: [ids]
    }
    sqlEntities.push(entity1)
    sqlEntities.push(entity2)

    // 事物回滚
    db.executeTransaction(sqlEntities, (err, rows) => {
        if (!err){
            return res.json({
                err: 1,
                message: '删除文章成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '删除文章失败.'
            })
        }
    })
})
