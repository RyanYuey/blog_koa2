
const { SuccessModel } = require('../model/resModel')
const router = require('koa-router')()
const { getDiaryList, getLabelList, getSortList } = require('../controller/common')

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

module.exports = router