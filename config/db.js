const env = process.env.NODE_ENV;
let MYSQL_CONF;
let REDIS_CONF;
// 如果是开发环境
if (env === 'dev') {
  // mysql配置
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '950823yy',
    port: '3306',
    database: 'yueyan_blog'
  }

  // redis配置
  REDIS_CONF = {
    port: '6379',
    host: '127.0.0.1'
  }
}

// 如果是线上环境
if (env === 'production') {
  // mysql配置
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '950823yy',
    port: '3306',
    database: 'yueyan_blog'
  }

  // redis配置
  REDIS_CONF = {
    port: '6379',
    host: '127.0.0.1'
  }
}

module.exports = {
  MYSQL_CONF,
  REDIS_CONF
}