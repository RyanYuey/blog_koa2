const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')      //引入session插件
const redisStore = require('koa-redis')             //引入redis插件，将session存入redis
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')                //日志插件
const koaBody = require('koa-body')                 //文件上传插件

// 引入公用方法
const { getUploadDirName, getUploadFileName, getUploadFileExt, checkDirExist } = require('./utils/util')

// 引入路由
const blog = require('./routes/blog')
const user = require('./routes/user')                         //用户接口
const commonRouter = require('./routes/com_router')           //公用接口
const article = require('./routes/article')                   //文章接口
const admin = require('./routes/admin')                       //管理员接口

// error handler
onerror(app)

// middlewares
// app.use(bodyparser({
//   enableTypes: ['json', 'form', 'text']
// }))
app.use(koaBody({
  multipart: true, // 支持文件上传
  // encoding: 'gzip',
  formidable: {
    uploadDir: path.join(__dirname, 'public/upload/'), // 设置文件上传目录
    keepExtensions: true,                              // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024,                    // 文件上传大小
    onFileBegin: (name, file) => {                     // 文件上传前的设置
      // 获取文件后缀
      const ext = getUploadFileExt(file.name)
      // 最终要保存到的文件夹目录
      const dirName = getUploadDirName()
      const dir = path.join(__dirname, `public/upload/${dirName}`)
      // 检查文件夹是否存在，不存在则新建文件夹
      checkDirExist(dir)
      // 获取文件名称
      const fileName = getUploadFileName(ext)
      // 重新覆盖file.path属性  这个其实并不是我们需要返回的路径
      file.path = `${dir}/${fileName}`
      // 在ctx中添加属性
      app.context.uploadPath = app.context.uploadPath ? app.context.uploadPath : {}
      app.context.uploadPath[name] = `upload/${dirName}/${fileName}`
    }
  }
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

const ENV = process.env.NODE_ENV;
if (ENV !== 'production') {
  // 开发环境
  app.use(morgan('dev', {
    stream: process.stdout //打印到控制台
  }))
} else {
  // 线上环境
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(morgan('combined', {
    stream: writeStream //打印到文件 logs -> access.log
  }))
}

// 配置session
app.keys = ['my-key#yy__app']   //根据这个密匙加密cookie
app.use(session({
  // 配置cookie
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  // 配置redis
  store: redisStore({
    all: '127.0.0.1'
  })
}))

// routes
app.use(blog.routes(), blog.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(commonRouter.routes(), commonRouter.allowedMethods())
app.use(article.routes(), article.allowedMethods())
app.use(admin.routes(), admin.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
