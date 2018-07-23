const express = require('express')
const db = require('../models/db2')
const cuid = require('cuid')
const util = require('../models/utils')

// 路由对象
const router = express.Router()
router.prefix = '/roles'

// 暴露路由模块
module.exports = router

/**
 * GET /roles/select
 */
router.get('/select', (req, res) => {
    db.query(`
        SELECT
            t1.id, t1.name
        FROM
            role t1
        WHERE
            t1.deleted=?
        ORDER BY 
            t1.sort ASC
    `, ['0'], rows => {
        
        let list = [{
            id: '0',
            name: '请选择角色'
        }]

        return res.json({
            err: 1,
            message: '',
            info: list.concat(rows)
        })
        
    })
})

/**
 * GET /roles/getlist
 */
router.get('/getlist', (req, res) => {
    db.query(`
        SELECT
            t1.id, t1.name, t1.desc, t1.sort, t1.create_time time
        FROM
            role t1
        WHERE
            t1.deleted=?
        ORDER BY 
            t1.sort ASC
    `, ['0'], rows => {
        return res.json({
            err: 1,
            message: '',
            info: rows
        })
    })
})

/**
 * GET /roles/save
 */
router.get('/save', (req, res) => {
    db.query(`select max(t1.sort) maxsort from role t1`, [], rows => {
        let maxSort = !rows[0].maxsort ? 0 : Number.parseInt(rows[0].maxsort)
        db.query(`insert into role values (?, ?, ?, ?, ?, ?, ?, ?)`, [
            cuid(),
            req.query.name,
            req.query.desc,
            req.body.sort || maxSort + 10,
            util.createTime(),
            util.createTime(),
            req.session.userid,
            '0'
        ], rows => {
            if (rows.affectedRows == 1){
                return res.json({
                    err: 1,
                    message: '添加角色成功.'
                })
            } else {
                return res.json({
                    err: 0,
                    message: '添加角色失败.'
                })
            }
        })
    })
})


/**
 * GET /roles/getone
 */
router.get('/getone', (req, res) => {
    db.query(`
        select 
            t1.name, t1.desc, t1.sort 
        from 
            role t1 
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
 * GET /roles/update
 */
router.get('/update', (req, res) => {
    db.query(`
        update 
            role t1 
        set 
            t1.name=?, t1.desc=?, t1.sort=?, t1.modify_time=?, t1.creator=?
        where 
            t1.id=?
    `, [
        req.query.name,
        req.query.desc,
        req.query.sort,
        util.createTime(),
        req.session.userid,
        req.query.id,
    ], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '更新角色成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '更新角色失败.'
            })
        }
    })
})


/**
 * GET /roles/sort
 */
router.get('/sort', (req, res) => {
    if (!(req.query.sort > 0)){
        return res.json({
            err: 0,
            message: '排序值有误.'
        })
    }
    db.query(`update role set sort=? where id=?`, [req.query.sort, req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '角色排序更新成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '角色排序更新失败.'
            })
        }
    })
})


/**
 * GET /roles/delete
 */
router.get('/delete', (req, res) => {
    db.query(`
        update 
            role t1 
        set 
            t1.deleted=? 
        where 
            t1.id=?
        and
            t1.id
        not in
            (select t1.role_id roleid from user t1 where t1.deleted='0')
        `, ['1', req.query.id], rows => {
        if (rows.affectedRows == 1){
            return res.json({
                err: 1,
                message: '删除角色成功.'
            })
        } else {
            return res.json({
                err: 0,
                message: '删除角色失败，请先删除角色下的用户！'
            })
        }
    })
})
