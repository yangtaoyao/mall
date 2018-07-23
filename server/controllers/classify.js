const express = require('express')
const db = require('../models/db2')
const cuid = require('cuid')
const util = require('../models/utils')

// 路由对象
const router = express.Router()
router.prefix = '/classify'

// 暴露路由模块
module.exports = router

/**
 * GET /classify/getlist
 */
router.get('/getlist', (req, res) => {
    db.query(`
        SELECT
            t1.id, t1.pid, t1.name as label, t1.url as link, t1.img_size, t1.sort
        FROM
            classify t1
        WHERE
            t1.deleted=?
        ORDER BY 
            t1.sort ASC
    `, ['0'], rows => {
        let root = { id: '0', name: '应用跟分类' }
        util.createTree(rows, root, '0')
        return res.json({
            err: 1,
            message: '',
            info: root
        })
    })
})

/**
 * GET /classify/sort
 */
router.get('/sort', (req, res) => {
    if (!(req.query.sort > 0)){
        return res.json({
            err: 0,
            message: '排序值有误.'
        })
    }
    db.query(`update classify set sort=? where id=?`, [req.query.sort, req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '分类排序更新成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '分类排序更新失败.'
            })
        }
    })
})

/**
 * GET /classify/select
 */
router.get('/select', (req, res) => {
    // 递归 菜单树转成一维数组 方法
    const formatClassifyList = (arr, obj, depth, isLast) => {
        arr.push({
            id: obj.id,
            name:  new Array(depth + 1).join('　') + (isLast ? '└' : '├') + obj.name,
            img_size: obj.img_size || ''
        })
        if (Array.isArray(obj.children) && obj.children.length > 0){
            depth++
            for (let i = 0, len = obj.children.length; i < len; i++){
                formatClassifyList(arr, obj.children[i], depth, i == len - 1)
            }
        }
    }

    db.query(`
        SELECT
            t1.id, t1.pid, t1.name, t1.img_size
        FROM
            classify t1
        WHERE
            t1.deleted=?
        ORDER BY 
            t1.sort ASC
    `, ['0'], rows => {
        let root = { id: '0', name: '应用跟分类', children: [] }
        util.createTree(rows, root, '0')
        let menus = []
        formatClassifyList(menus, root, 0, true)
        return res.json({
            err: 1,
            message: '',
            info: menus
        })
    })
})

/**
 * GET /classify/save
 */
router.post('/save', (req, res) => {
    db.query(`insert into classify values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        cuid(),
        req.body.pid,
        req.body.name,
        req.body.desc,
        req.body.url,
        req.body.img_size,
        req.body.sort || '100',
        util.createTime(),
        util.createTime(),
        req.session.userid,
        '0'
    ], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '添加分类成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '添加分类失败.'
            })
        }
    })
})

/**
 * GET /classify/getone
 */
router.get('/getone', (req, res) => {
    db.query(`
        select 
            t1.id, t1.pid, t1.name, t1.url, t1.img_size, t1.sort, t1.desc
        from
            classify t1
        where 
            t1.id=?
    `, [req.query.id], rows => {
            res.json({
                err: 1,
                message: '',
                info: rows[0]
            })
        })
})

/**
 * GET /classify/update
 */
router.post('/update', (req, res) => {
    db.query(`
        update 
            classify t1 
        set
            t1.pid=?, t1.name=?, t1.desc=?, t1.url=?, t1.img_size=?, t1.sort=?, t1.modify_time=?, t1.creator=?
        where 
            t1.id=?
    `, [
        req.body.pid,
        req.body.name,
        req.body.desc,
        req.body.url,
        req.body.img_size,
        req.body.sort,
        util.createTime(),
        req.session.userid,
        req.body.id
    ], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '更新分类成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '更新分类失败.'
            })
        }
    })
})

/**
 * GET /classify/delete
 */
router.get('/delete', (req, res) => {
    db.query(`update classify t1 set t1.deleted=? where t1.id=?`, ['1', req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '删除分类成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '删除分类失败.'
            })
        }
    })
})