const mysql = require('mysql');
const database = require('./database');

database.connection.connectionLimit = 10;
module.exports = mysql.createPool(database.connection);
