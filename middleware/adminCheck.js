/* 
  管理员验证中间件
*/

const { ErrorModel } = require('../model/resModel')

module.exports = async (ctx, next) => {
  if (ctx.session.user_type && ctx.session.user_type === 2) {
    await next()
    return
  }
  ctx.body = new ErrorModel('只有管理员账号才能操作')
}