/* 
  后台验证前端参数
*/
// const Joi = require('joi')
const { ErrorModel } = require('../model/resModel')
const schemaObj = require('../utils/volidate')

module.exports = async (ctx, next) => {
  const schema = ctx.url.replace(/\//g, '_')
  const { error } = schemaObj[schema].validate(ctx.request.body, {
    abortEarly: true,
    convert: false
  })
  console.log(error)
  if (error == null) {
    await next()
    return;
  }

  ctx.body = new ErrorModel(error.details[0]['message'])
}