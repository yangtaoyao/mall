const express = require('express')
const db = require('../models/db2')
const cuid = require('cuid')
const util = require('../models/utils')

// 路由对象
const router = express.Router()
router.prefix = '/menu'

// 暴露路由模块
module.exports = router

/**
 * GET /menu/getlist
 */
router.get('/getlist', (req, res) => {
    // 递归生成菜单树方法
    let createMenuTree = (arr, obj, pid) => {
        for (let i = 0; i < arr.length; i++){
            if (arr[i].pid === pid){
                if (Array.isArray(obj.list)){
                    obj.list.push(arr[i])
                } else {
                    obj.list = [arr[i]]
                }
                createMenuTree(arr, arr[i], arr[i].id)
            }
        }
    }

    // db.query(`select t1.role_id from user t1 where t1.id=?`, [req.session.userid], rows => {
        // rows[0].role_id  
        db.query(`
            SELECT
                t1.id, t1.pid, t1.name title, t1.url link, t1.icon iconName
            FROM
                menu t1
            INNER JOIN 
                role_menu t2
            ON
                t1.id=t2.menu_id
            WHERE
                t1.deleted='0'
            AND
                t2.role_id=?
            AND
                t2.access='1'
            ORDER BY 
                t1.sort ASC
        `, ['1'], rows => {
            let root = { id: '0', title: '系统跟分类' }
            createMenuTree(rows, root, '0')
            return res.json({
                err: 1,
                message: '',
                info: root
            })
        })
    // })
})

/**
 * GET /menu/getall
 */
router.get('/getall', (req, res) => {
    db.query(`
        SELECT
            t1.id, t1.pid, t1.name label, t1.url link, t1.icon iconName, t1.sort, t1.deleted
        FROM
            menu t1
        ORDER BY 
            t1.sort ASC
    `, [], rows => {
        let root = { id: '0', name: '系统跟分类' }
        util.createTree(rows, root, '0')
        return res.json({
            err: 1,
            message: '',
            info: root
        })
    })
})

/**
 * GET /menu/sort
 */
router.get('/sort', (req, res) => {
    if (!(req.query.sort > 0)){
        return res.json({
            err: 0,
            message: '排序值有误.'
        })
    }
    db.query(`update menu set sort=? where id=?`, [req.query.sort, req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '菜单排序更新成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '菜单排序更新失败.'
            })
        }
    })
})

/**
 * GET /menu/select
 */
router.get('/select', (req, res) => {
    // 递归 菜单树转成一维数组 方法
    const formatMenuList = (arr, obj, depth, isLast) => {
        if (depth > 2) return
        arr.push({
            id: obj.id,
            name:  new Array(depth + 1).join('　') + (isLast ? '└' : '├') + obj.name
        })
        if (Array.isArray(obj.children) && obj.children.length > 0){
            depth++
            for (let i = 0, len = obj.children.length; i < len; i++){
                formatMenuList(arr, obj.children[i], depth, i == len - 1)
            }
        }
    }

    db.query(`
        SELECT
            t1.id, t1.pid, t1.name
        FROM
            menu t1
        WHERE
            t1.deleted=?
        ORDER BY 
            t1.sort ASC
    `, ['0'], rows => {
        let root = { id: '0', name: '系统跟分类', children: [] }
        util.createTree(rows, root, '0')
        let menus = []
        formatMenuList(menus, root, 0, true)
        console.log(menus)
        return res.json({
            err: 1,
            message: '',
            info: menus
        })
    })
})


/**
 * GET /menu/save
 */
router.post('/save', (req, res) => {
    db.query(`insert into menu values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        cuid(),
        req.body.pid,
        req.body.name,
        req.body.desc,
        req.body.url,
        req.body.icon,
        req.body.sort || '100',
        util.createTime(),
        util.createTime(),
        req.session.userid,
        '0'
    ], rows => {
        if (rows.affectedRows == 1){
            // 处理 `角色 权限` 的关联表
            return res.json({
                err: 1,
                message: '添加菜单成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '添加菜单失败.'
            })
        }
    })
})


/**
 * GET /menu/getone
 */
router.get('/getone', (req, res) => {
    db.query(`
        select 
            t1.id, t1.pid, t1.name, t1.url, t1.icon, t1.sort, t1.desc
        from
            menu t1
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
 * GET /menu/update
 */
router.post('/update', (req, res) => {
    db.query(`
        update 
            menu t1 
        set
            t1.pid=?, t1.name=?, t1.desc=?, t1.url=?, t1.icon=?, t1.sort=?, t1.modify_time=?, t1.creator=?
        where 
            t1.id=?
    `, [
        req.body.pid,
        req.body.name,
        req.body.desc,
        req.body.url,
        req.body.icon,
        req.body.sort,
        util.createTime(),
        req.session.userid,
        req.body.id
    ], rows => {
        if (rows.affectedRows == 1){
            // 处理 `角色 权限` 的关联表
            return res.json({
                err: 1,
                message: '更新菜单成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '更新菜单失败.'
            })
        }
    })
})

/**
 * GET /menu/delete
 */
router.get('/delete', (req, res) => {
    // 处理 `角色 权限` 的关联表
    db.query(`update menu t1 set t1.deleted=? where t1.id=?`, ['1', req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '删除菜单成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '删除菜单失败.'
            })
        }
    })
})
