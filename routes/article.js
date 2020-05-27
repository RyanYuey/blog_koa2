const router = require('koa-router')()
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')              //登录验证中间件
const paramsVolidate = require('../middleware/paramsVolidate')      // 参数验证中间件
const { getList, getDetail, setArticleLike, setComment, deleteComment, getFurtherReading, getCommentList, getHotArticles } = require('../controller/article')
const { getClientIP } = require('../utils/util')                                 // 工具方法

router.prefix('/api/article')

// 获取博文列表
router.get('/list', async (ctx, next) => {
  const keyword = ctx.query.keyword || ''
  const sort_id = ctx.query.sort_id || ''
  const page = ctx.query.page || 1
  const page_size = ctx.query.page_size || 10000
  ctx.body = await getList(keyword, sort_id, page, page_size)
})

// 获取热门博文列表
router.get('/hot_article', async (ctx) => {
  ctx.body = await getHotArticles()
})

// 获取博文详情
router.get('/detail', async (ctx, next) => {
  const id = ctx.query.id
  if (!id) {
    ctx.body = new ErrorModel('文章id必须传')
    return;
  }
  const data = await getDetail(id)
  ctx.body = new SuccessModel(data)
})

// 博客点赞
router.post('/like', paramsVolidate, async (ctx, next) => {
  // 获取用户ip地址
  const ip = getClientIP(ctx.req)
  const { article_id, like_status } = ctx.request.body
  const result = await setArticleLike(ip, article_id, like_status)
  if (result) {
    ctx.body = new SuccessModel('修改成功')
  } else {
    ctx.body = new ErrorModel('修改失败')
  }

})
// 获取评论列表
router.get('/comment_list', async (ctx) => {
  const topic_type = ctx.query.topic_type
  const topic_id = ctx.query.topic_id
  ctx.body = await getCommentList(topic_type, topic_id)
})

// 发表博客评论
router.post('/comment', loginCheck, paramsVolidate, async (ctx, next) => {
  const user_info = {
    user_id: ctx.session.user_id,
    user_avatar: ctx.session.user_avatar,
    user_nickname: ctx.session.user_nickname
  }
  const data = await setComment(user_info, ctx.request.body)

  ctx.body = new SuccessModel(data)
})

// 删除评论
router.post('/del_comment', loginCheck, paramsVolidate, async (ctx, next) => {
  const user_id = ctx.session.user_id
  const result = await deleteComment(user_id, ctx.request.body)
  if (result) {
    ctx.body = new SuccessModel('删除成功')
  } else {
    ctx.body = new ErrorModel('删除失败')
  }
})

// 获取博客详情延申阅读数据
router.get('/further_reading', async (ctx) => {
  ctx.body = await getFurtherReading(ctx.query.id)
})

module.exports = router