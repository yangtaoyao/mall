const express = require('express')
// const md5 = require('md5')
const db = require('../../models/db2')

// 路由对象
const router = express.Router()
router.prefix = '/erp/login'

// 暴露路由模块
module.exports = router

/**
 *   /login/do
 */
router.post('/do', (req, res) => {
    console.log("erp/login/do");
    console.log(req.body.params);
    db.query(`
        SELECT 
        *
        FROM 
        USER t1
        WHERE 
        t1.username=?
        AND 
        t1.password=?
        `, [req.body.params.username, req.body.params.password], function(rows){
        //   [] ,function(rows){
        console.log("rows:"+JSON.stringify(rows))
        if (rows.length > 0){
            // 判断 session 记录
            const isLogin = req.session.isLogin
            // 登录状态写入 session
            if (!isLogin){
                req.session.isLogin = 1
                req.session.userid  = rows[0].id
                req.session.username = rows[0].username
            }
            console.log("cookie========"+JSON.stringify(req.cookies));
            console.log("session========"+JSON.stringify(req.session))
            // 下发 cookie
           // res.cookie('Admin-Token', rows[0].id)
            res.cookie('username', rows[0].username);
            // 处理系统登录记录日志表
            
            // 返回数据
            return res.json({
                err: 1,
                message: '登录成功.',
                info: {
                    id: rows[0].id,
                    name: rows[0].username
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
    console.log("jout cookie========"+JSON.stringify(req.cookies));
    console.log("out session========"+JSON.stringify(req.session))
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
