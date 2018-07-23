const express = require('express')
const db = require('../models/db2')
const cuid = require('cuid')
const util = require('../models/utils')

// 路由对象
const router = express.Router()
router.prefix = '/permission'

// 暴露路由模块
module.exports = router

/**
 * GET /permission/get
 */
router.get('/get', (req, res) => {
    // 递归创建拥有权限的菜单ID数组
    let createCheckeds = (obj, arr) => {
        if (typeof obj.children == 'undefined' && obj.access == '1'){
            arr.push(obj.id)
        }
        if (Array.isArray(obj.children)){
            for (let i = 0; i < obj.children.length; i++){
                createCheckeds(obj.children[i], arr)
            }
        }
    }
    
    db.query(`
        SELECT
            t1.id, t1.pid, t1.name label
        FROM
            menu t1
        WHERE
            t1.deleted='0'
        ORDER BY 
            t1.sort ASC
        ;
        SELECT
            t1.menu_id AS id
        FROM
            role_menu t1
        WHERE
            t1.role_id=?
        AND
	        t1.access='1'
	    AND
            t1.menu_id 
        NOT IN 
            (SELECT pid FROM menu)
    `, [req.query.roleid], rows => {
        let root = { id: '0', name: '系统跟分类' }
        util.createTree(rows[0], root, '0')
        return res.json({
            err: 1,
            message: '',
            info: root.children || [],
            checkeds: rows[1].map(item => item.id)
        })
    })
})

/**
 * GET /permission/save
 */

router.get('/save', (req, res) => {
    let menuids   = req.query.menuids.split(',')

    let sqlEntities = [{
        sql: `delete from role_menu where role_id=?`,
        params: [req.query.roleid]
    }]
    for (let i = 0; i < menuids.length; i++){
        let entity = {
            sql: `insert into role_menu values (?, ?, ?, ?, ?, ?, ?)`,
            params: [
                cuid(),
                menuids[i],
                req.query.roleid,
                '1',
                req.session.userid,
                util.createTime(),
                util.createTime()
            ]
        }
        sqlEntities.push(entity)
        entity = null
    }

    // 事物回滚
    db.executeTransaction(sqlEntities, (err, rows) => {
        if (!err){
            return res.json({
                err: 1,
                message: '角色权限设置成功.'
            })
        } else {
            return res.json({
                err: 1,
                message: '角色权限设置失败.'
            })
        }
    })
})
