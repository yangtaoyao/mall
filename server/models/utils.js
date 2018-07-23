const db = require('./db2')
const pinyin = require('pinyin')
const dateFormat = require('dateformat')

// 递归生成菜单树方法
const createTree = (arr, obj, pid) => {
    for (let i = 0; i < arr.length; i++){
        if (arr[i].pid === pid){
            if (Array.isArray(obj.children)){
                obj.children.push(arr[i])
            } else {
                obj.children = [arr[i]]
            }
            createTree(arr, arr[i], arr[i].id)
        }
    }
}

// 生成拼音头
const getPinyintou = (str) => {
    const pinyintou = pinyin(str, { style: pinyin.STYLE_FIRST_LETTER }).reduce((sum, item, index) => {
        if (Array.isArray(sum)){
            sum = sum[0]
        }
        return sum + item[0]
    })
    return pinyintou
}

// 创建当前时间
const createTime = () => dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')

// 生成分页 limit sql
const generatePageSql = (pageNum, pageSize) => {
    pageNum  = pageNum > 0 ? Number(pageNum) : 1
    pageSize = pageSize > 0 ? Number(pageSize) : 10
    return db.format(` LIMIT ?, ?`, [(pageNum - 1) * pageSize, pageSize])
}

// 根据文件路径获取文件名
const getFileName = (filePath) => {
    const regExp = /\/\d+_\d{4}\.[a-zA-Z]{3,4}$/
    const result = filePath.toString().match(regExp)
    return Array.isArray(result) ? result[0] : ''
}


module.exports = { createTree, getPinyintou, createTime, generatePageSql, getFileName }