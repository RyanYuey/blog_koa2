/* 
  登录验证中间件
*/

const { ErrorModel } = require('../model/resModel')

module.exports = async (ctx, next) => {
  if (ctx.session.user_id) {
    await next()
    return
  }
  ctx.body = new ErrorModel('未登录')
}