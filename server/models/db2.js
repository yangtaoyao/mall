const mysql = require('mysql');
const pool  = require('./pool');
const mysqlTran = require('mysql-tran');

/**
 * 
 * @param {String Array} sql 或 [{sql: ``, params: []}, {sql: ``, params: []}, ...]
 * @param {Array} arr 可选
 * @param {Function} callback 
 */
exports.query = function(sql, arr, callback){
    const argNum = arguments.length;
    pool.getConnection(function(err, connection){
        if (err) throw err;
        // connection -> 在连接池中申请到的，可用的 连接资源
        if (argNum === 3){
            connection.query(sql, arr, function (err, results, fields){
                // 释放资源 -> 把当前的连接资源返回给连接池
                connection.release();
                if (err) throw err;
                callback && callback(results, fields);
            });
        }
        if (argNum === 2){
            callback = arr;
            let sqlArr = [];
            let params = [];
            for (let i = 0; i < sql.length; i++){
                sqlArr.push(sql[i].sql);
                params.concat(sql[i].params);
            }
            connection.query(sqlArr.join(';'), params, function (err, results, fields){
                connection.release();
                if (err) throw err;
                callback && callback(results, fields);
            });
        }
    });
};

/**
 * 
 * @param {Array} entities  [{sql: ``, params: []}, {sql: ``, params: []}, ...]
 * @param {Function} callback
 */
exports.executeTransaction = function(entities, callback){
    pool.getConnection(function(err, connection){
        if (err) throw err;
        mysqlTran.executeTransaction(connection, entities, function (err, rows){
            callback && callback(err, rows);
        });
    });
};

// 防止sql注入
exports.escape = function(params){
    return mysql.escape(params);
};

// 格式化sql语句
exports.format = function (sql, arr){
    return mysql.format(sql, arr);
};
