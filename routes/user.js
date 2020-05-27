const router = require('koa-router')()
const { login, register, getUserList } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { getClientIP } = require('../utils/util')                                 // 工具方法
const paramsVolidate = require('../middleware/paramsVolidate')

router.prefix('/api/user')

// 登录
router.post('/login', paramsVolidate, async (ctx, next) => {
  const { user_name, user_password } = ctx.request.body

  const data = await login(user_name, user_password)
  if (data.user_name) {
    ctx.session.user_id = data.user_id
    ctx.session.user_name = data.user_name
    ctx.session.user_type = data.user_type
    ctx.session.user_avatar = data.user_avatar
    ctx.session.user_nickname = data.user_nickname
    ctx.body = new SuccessModel(data, '登录成功')
    return
  }
  ctx.body = new ErrorModel('用户名或密码不正确')
})
// 注册
router.post('/register', paramsVolidate, async (ctx, next) => {
  ctx.request.body.user_ip = getClientIP(ctx.req)
  const result = await register(ctx.request.body)
  ctx.body = result
})

// 获取用户列表
router.get('/list', async (ctx) => {
  ctx.body = await getUserList()
})

// 退出登录
router.post('/logout', async (ctx, next) => {
  ctx.session = null
  ctx.body = new SuccessModel('您已退出')
})

module.exports = router