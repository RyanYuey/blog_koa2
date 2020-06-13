const mysql = require('mysql');
const { MYSQL_CONF } = require('../config/db');

// 创建连接对象
// const con = mysql.createConnection(MYSQL_CONF);

// 开始连接
// con.connect();

// 统一执行sql的函数
function exec (sql) {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result)
    })
  })
}

/** 修改线上bug mysql连接出现 PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR  */
// 创建连接池
const pool = mysql.createPool(MYSQL_CONF);
function query (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {

          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}


module.exports = {
  exec: query,
  escape: mysql.escape
}