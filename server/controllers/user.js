const express = require('express')
const db = require('../models/db2')
const cuid = require('cuid')
const util = require('../models/utils')
const md5 = require('md5')

// 路由对象
const router = express.Router()
router.prefix = '/user'

// 暴露路由模块
module.exports = router

/**
 * GET /user/getlist
 */
router.get('/getlist', (req, res) => {
    // console.log(req.query)
    let sqlStr = ``
    // 根据 姓名/拼音头/手机 查询
    if (req.query.input !== ''){
        sqlStr += db.format(` AND (t1.name LIKE ? OR t1.pinyin=? OR t1.phone=?)`, [`%${req.query.input}%`, req.query.input, req.query.input])
    }
    // 根据角色查询
    if (Number(req.query.role) !== 0){
        sqlStr += db.format(` AND t1.role_id=?`, [req.query.role])
    }

    const entitys = []

    // 分页sql
    const pagination = {
        sql: `
            SELECT
                t1.id, t1.name,
            CASE
                t1.sex
                WHEN '0' THEN '男'
                WHEN '1' THEN '女'
            END AS
                sex, t1.phone, t1.email
            FROM
                user t1
            WHERE
                t1.deleted='0'
            ${sqlStr}
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
                user t1
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
 * GET /user/save
 */
router.post('/save', (req, res) => {
    // console.log(req.body)
    db.query(`
        insert into 
            user (id, username, password, name, pinyin, sex, phone, email, role_id, create_time, modify_time, deleted) 
        values 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        cuid(),
        req.body.username,
        md5(md5(req.body.password)),
        req.body.name,
        util.getPinyintou(req.body.name),
        req.body.sex,
        req.body.phone,
        req.body.email,
        req.body.role_id,
        util.createTime(),
        util.createTime(),
        '0'
    ], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '添加用户成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '保存用户记录失败.'
            })
        }
    })
})

/**
 * GET /user/getone
 */
router.get('/getone', (req, res) => {
    const userid = !req.query.id ? req.session.userid : req.query.id
    db.query(`
        SELECT 
            t1.id, t1.username, t1.name, t1.sex, t1.phone, t1.email, t1.role_id, t2.name role_name
        FROM 
            user t1
        LEFT JOIN
            role t2
        ON
            t1.role_id=t2.id
        WHERE 
            t1.id=?
    `, [userid], rows => {
        res.json({
            err: 1,
            message: '',
            info: rows[0]
        })
    })
})

/**
 * GET /user/update
 */
router.post('/update', (req, res) => {
    // 密码 sql
    let pwdSql = !req.body.password ? `` : `, t1.password=${db.escape(md5(md5(req.body.password)))}`
    db.query(`
        update 
            user t1
        set 
            t1.username=?, t1.name=?, t1.pinyin=?, t1.sex=?, t1.phone=?, t1.email=?, t1.role_id=?, t1.modify_time=? ${pwdSql}
        where
            t1.id=?
    `, [
        req.body.username,
        req.body.name,
        util.getPinyintou(req.body.name),
        req.body.sex,
        req.body.phone,
        req.body.email,
        req.body.role_id,
        util.createTime(),
        req.body.id
    ], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '更新用户成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '更新用户失败.'
            })
        }
    })
})

/**
 * GET /user/delete
 */
router.get('/delete', (req, res) => {
    db.query(`update user t1 set t1.deleted=? where t1.id=?`, ['1', req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '删除用户成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '删除用户失败.'
            })
        }
    })
})


/**
 * GET /user/resetpwd
 */
router.post('/resetpwd', (req, res) => {
    if (req.body.newPass !== req.body.checkPass){
        return res.json({
            err: 0,
            message: '两次密码不一致.'
        })
    }
    db.query(`
        select
            t1.password
        from
            user t1
        where
            t1.id=?
    `, [req.session.userid], rows => {
        if (rows.length > 0 && rows[0].password === md5(md5(req.body.pass))){
            db.query(`
                update
                    user t1
                set
                    t1.password=?
                where
                    t1.id=?
            `, [md5(md5(req.body.checkPass)), req.session.userid], rows => {
                if (rows.affectedRows == 1){
                    return res.json({
                        err: 1,
                        message: '新密码设置成功.'
                    })
                } else {
                    return res.json({
                        err: 0,
                        message: '新密码设置失败.'
                    })
                }
            })
        } else {
            return res.json({
                err: 0,
                message: '密码输入不正确.'
            })
        }
    })
})
