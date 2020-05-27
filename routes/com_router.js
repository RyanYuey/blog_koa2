const loginCheck = require('./../middleware/loginCheck')
const { SuccessModel } = require('../model/resModel')
const router = require('koa-router')()
const { getDiaryList, getLabelList, getSortList, getMessage, newMessage, deleteMessage, getImages } = require('../controller/common')

// 文件上传
router.post('/api/upload', async (ctx, next) => {
  ctx.body = ctx.uploadPath
})

// 获取日记列表
router.get('/api/diary/list', async (ctx) => {
  ctx.body = await getDiaryList()
})


// 标签列表
router.get('/api/label/list', async (ctx) => {
  ctx.body = await getLabelList()
})

// 分类列表
router.get('/api/sort/list', async (ctx) => {
  ctx.body = await getSortList()
})

// 留言列表
router.get('/api/message_list', async (ctx) => {
  ctx.body = await getMessage()
})

// 添加留言
router.post('/api/new_message', loginCheck, async (ctx) => {
  const user_info = {
    user_id: ctx.session.user_id,
    user_avatar: ctx.session.user_avatar,
    user_nickname: ctx.session.user_nickname
  }
  ctx.body = await newMessage(user_info, ctx.request.body)
})

// 删除留言
router.post('/api/del_message', loginCheck, async (ctx) => {
  const user_id = ctx.session.user_id
  ctx.body = await deleteMessage(user_id, ctx.request.body.id)
})

// 获取默认图片列表
router.get('/api/img_list', async (ctx) => {
  ctx.body = await getImages(ctx.query.type)
})
module.exports = router