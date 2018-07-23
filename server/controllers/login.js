const express = require('express')
const md5 = require('md5')
const db = require('../models/db2')

// 路由对象
const router = express.Router()
router.prefix = '/login'

// 暴露路由模块
module.exports = router

/**
 * GET /login/do
 */
router.post('/do', (req, res) => {
    // console.log(req.body)
    db.query(`
        SELECT 
            t1.id, t1.name, t2.name roles
        FROM 
            user t1
        LEFT JOIN 
            role t2
        ON 
            t1.role_id=t2.id
        WHERE 
            t1.username=?
        AND 
            t1.password=?
        AND 
            t1.deleted='0'
        AND 
            t2.deleted='0'
        `, [req.body.username, md5(md5(req.body.password))], rows => {
        if (rows.length > 0){
            // 判断 session 记录
            const isLogin = req.session.isLogin
            // 登录状态写入 session
            if (!isLogin){
                req.session.isLogin = 1
                req.session.userid  = rows[0].id
                req.session.name = rows[0].name
            }
            
            // 下发 cookie
            res.cookie('Admin-Token', rows[0].id)
            res.cookie('username', rows[0].name)
            // console.log(req.session.userid)

            // 处理系统登录记录日志表
            
            // 返回数据
            return res.json({
                err: 1,
                message: '登录成功.',
                info: {
                    id: rows[0].id,
                    name: rows[0].name,
                    roles: [rows[0].roles]
                }
            })
        } else {
            return res.json({
                err: 0,
                message: '用户名或密码有误.'
            })
        }
    })
})

/**
 * GET /login/out
 */
router.get('/out', (req, res) => {
    // 销毁 session
    req.session.destroy(err => {
        if (err){
            return res.json({
                err: 0,
                message: '退出登录失败.'
            })
        }
        // 删除 cookie
        res.clearCookie('Admin-Token')
        res.clearCookie('username')
        return res.json({
            err: 1,
            message: '退出登录成功.'
        })
    })
})
