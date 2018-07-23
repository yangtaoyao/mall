const express = require('express')
const db = require('../models/db2')
const cuid = require('cuid')
const util = require('../models/utils')

// 路由对象
const router = express.Router()
router.prefix = '/site'

// 暴露路由模块
module.exports = router

/**
 * GET /site/getone
 */
router.get('/getone', (req, res) => {
    db.query(`
        select
            id, domain, title, keywords, description, copy, address, telephone, email, records
        from
            site_config
        where
            deleted='0'
    `, [], rows => {
        if (rows.length > 0){
            return res.json({
                err: 1,
                message: '',
                info: rows[0]
            })
        } else {
            return res.json({
                err: 0,
                message: '暂无数据，请点击保存执行添加.',
                info: {}
            })
        }
    })
})

/**
 * GET /site/save
 */
router.post('/save', (req, res) => {
    let querySql = ``
    if (req.body.id !== ''){ // 更新
        querySql = db.format(
            `update
                site_config
            set
                domain=?, title=?, keywords=?, description=?, copy=?, address=?, telephone=?, email=?, records=?
            where
                id=?
            `, [
                req.body.domain,
                req.body.title,
                req.body.keywords,
                req.body.description,
                req.body.copy,
                req.body.address,
                req.body.telephone,
                req.body.email,
                req.body.records,
                req.body.id,
            ])
    } else { // 插入
        querySql = db.format(
            `insert into
                site_config
            values
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                cuid(),
                req.body.domain,
                req.body.title,
                req.body.keywords,
                req.body.description,
                req.body.copy,
                req.body.address,
                req.body.telephone,
                req.body.email,
                req.body.records,
                util.createTime(),
                util.createTime(),
                req.session.userid,
                '0'
            ])
    }

    db.query(querySql, [], rows => {
        if (rows.affectedRows){
            return res.json({
                err: 1,
                message: '网站配置信息保存成功.'
            })
        }
    })
})
