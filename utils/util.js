const path = require('path')
const fs = require('fs')

module.exports = {
  /* 文件类操作 */
  // 生成上传文件夹名称
  getUploadDirName () {
    const date = new Date();
    let month = Number.parseInt(date.getMonth()) + 1;
    month = month.toString().length > 1 ? month : `0${month}`
    const dir = `${date.getFullYear()}${month}${date.getDate()}`
    return dir
  },
  // 检查文夹路径是否存在，不存在创建
  checkDirExist (p) {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p)
    }
  },
  // 获取文件后缀
  getUploadFileExt (name) {
    const nameFormat = name.split('.')
    const ext = nameFormat[nameFormat.length - 1]
    return ext
  },
  // 自己定义文件名
  getUploadFileName (ext) {
    return `upload_${Date.now()}.${ext}`
  },
  /* 
    ip操作
  */
  // 获取用户ip
  getClientIP (req) {
    const ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    console.log('用户ip地址：', ip)
    return ip
  }
}