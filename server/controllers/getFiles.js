const app = require('../server.js')
const express = require('express')
const path = require('path')
const fs = require('fs')
const formidable = require('formidable')
const dateFormat = require('dateformat')

//服务器静态文件路径 
const url=app.get('url');

// 路由对象
const router = express.Router()
router.prefix = '/getFiles'

// 暴露路由模块
module.exports = router
router.get('/rotateImg', (req, res) => {
    const rotateUploadpath = app.get('rotateUploadpath');
    var list = getFiles.getImageFiles(rotateUploadpath);
    console.log("=====filesListc:"+JSON.stringify(imageList));
    var imageList=[]
    console.log(url)
    list.forEach(function(item){
        var obj={};
        obj.url=url+"uploads/rotate/"+item.filename;
        obj.name=item.filename;
        console.log(item.filename);
        imageList.push(obj);
    })
    return res.json({
        err: 1,
        message:"获取轮播图成功",
        imageList:imageList
    })
})

function readFileList(path, filesList) {
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        console.log(itm, path)
        var obj = {}; //定义一个对象存放文件的路径和名字        
        obj.path = path; //路径         
        obj.filename = itm //名字          
        filesList.push(obj);
    })
}
var getFiles = {
    //获取文件夹下的所有文件   
    getFileList: function (path) {
        var filesList = [];
        readFileList(path, filesList);
        // console.log("========filesListc========:"+JSON.stringify(filesList))
        return filesList;
    },
    //获取文件夹下的所有图片   
    getImageFiles: function (path) {
        var imageList = this.getFileList(path);
        // this.getFileList(path).forEach((item) => {
        //     var ms = image(fs.readFileSync(item.path + item.filename));
        //     ms.mimeType && (imageList.push(item.filename))
        // });
        return imageList;
    }
};