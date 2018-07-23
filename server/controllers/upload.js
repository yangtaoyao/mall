/**
 * @Author: jzy
 * @Date: 2017/1/10
 * @Last Modified by: jzy
 * @Last Modified time: 2017/1/10
 */
const app = require('../server.js')
const express = require('express')
const path = require('path')
const fs = require('fs')
const formidable = require('formidable')
const dateFormat = require('dateformat')

// 路由对象
const router = express.Router()
router.prefix = '/upload'

// 暴露路由模块
module.exports = router

/*
 * GET /upload/do
 */
router.post('/do', (req, res) => {
    // creates a new incoming form
    const form = new formidable.IncomingForm()
    //  文件上传文件夹
    const uploadPath = app.get('tempuploadpath')
    // 判断文件夹是否存在，false -> create
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath)
    }
    // 指定文件上传路径
    form.uploadDir = uploadPath
    // 不处理空文件
    form.onPart = part => {
        if (part.filename !== ''){
            form.handlePart(part)
        }
    }
    // 处理 request
    form.parse(req, (err, fields, files) => {
        if (err){
            console.error('formidable error')
            return res.json({
                err: 0,
                message: '文件上传失败！'
            })
        }
        let filePaths = []
        let fileUrls  = []
        for (let attr in files){
            // 文件对象
            const file = files[attr]
            // 生成文件名
            const filename = `${dateFormat(new Date(), 'yyyymmddhhMMss')}_${Math.random().toString().slice(2).substr(0, 4)}${path.extname(file.name)}`
            // 文件改名
            fs.renameSync(file.path, path.join(uploadPath, filename))
            // 加入数组
            filePaths.push(`/uploads/temp/${filename}`)
            fileUrls.push(`http://${req.headers.host}/uploads/temp/${filename}`)
        }
        // 返回结果
        return res.json({
            err: 1,
            message: '',
            filePaths,
            fileUrls
        })
    })
})

/*
 * GET /upload/del
 */
router.get('/del', (req, res) => {
    const filepath = path.join(app.get('tempuploadpath'), req.query.filename)
    fs.stat(filepath, (err, stats) => {
        if (err){
            return res.json({
                errCode: 0,
                errMsg: '文件不存在'
            })
        }
        if (stats.isFile()){
            // 移动图片文件
            fs.unlink(filepath, err => {
                if (err){
                    console.error(err)
                }
                res.json({
                    errCode: 1,
                    errMsg: '文件删除成功'
                })
            })
        }
    })
})
