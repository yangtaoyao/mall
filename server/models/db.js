/**
 * @Author: Jzy
 * @Date: 2016/10/17
 * @Last Modified by: Jzy
 * @Last Modified time: 2016/10/17
 */
const mysql    = require('mysql');
const database = require('./database.js');
const mysqlTran = require('mysql-tran');

// 数据库操作
exports.query = function(query, arr, callback){
    const connection = mysql.createConnection(database.connection);
    connection.connect(function (err){
        if (err){
            return console.error('error connecting: ' + err.stack);
        }
    });

    if (arguments.length === 2){ // 普通sql语句方式
        callback = arr;
        connection.query(query, function (err, rows, fields){
            if (err) throw err;
            callback && callback(rows, fields);
        });
    } else { // 查询参数占位方式
        connection.query(query, arr, function (err, rows, fields){
            if (err) throw err;
            callback && callback(rows, fields);
        });
    }

    connection.end();
};

/**
 * 
 * @param {Array} entities  [{sql: ``, params: []}, {sql: ``, params: []}, ...]
 * @param {Function} callback
 */
exports.executeTransaction = function(entities, callback){
    const connection = mysql.createConnection(database.connection);
    connection.connect(function (err){
        if (err){
            return console.error('error connecting: ' + err.stack);
        }
    });

    mysqlTran.executeTransaction(connection, entities, function (err, res){
        if (err) throw err;
        callback && callback(res);
    });
    
    connection.end();
};

// 防止sql注入
exports.escape = function(params){
    return mysql.escape(params);
};

// 格式化sql语句
exports.format = function(sql, arr){
    return mysql.format(sql, arr)
};

