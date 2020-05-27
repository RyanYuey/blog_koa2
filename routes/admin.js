const router = require('koa-router')()
const { SuccessModel, ErrorModel } = require('../model/resModel')
const adminCheck = require('../middleware/adminCheck')              //管理员验证中间件
const paramVolidation = require('../middleware/paramsVolidate')
const {
  newArticle, updateArticle, deleteArticle, newDiary, deleteDiary,
  newLabel, deleteLabel, newSort, updateSort, updateLabel, deleteSort,
  updateUser, addDefaultAvatar, deleteDefaultAvatar, deleteUser
} = require('../controller/admin')

router.prefix('/api/admin')

// 过滤一下路由，防止非管理员操作,当前文件所有路由都会执行这一步
router.use(adminCheck)

/* 操作博客 */
// 新建博客
router.post('/new_article', paramVolidation, async (ctx, next) => {
  const user_id = ctx.session.user_id
  ctx.body = await newArticle(user_id, ctx.request.body)
})

// 更新博客
router.post('/update_article', paramVolidation, async (ctx, next) => {
  const user_id = ctx.session.user_id
  ctx.body = await updateArticle(user_id, ctx.request.body)
})

// 删除博客
router.post('/del_article', paramVolidation, async (ctx, next) => {
  const user_id = ctx.session.user_id
  ctx.body = await deleteArticle(user_id, ctx.request.body.article_id)
})

/* 操作日记 */
// 新建日记
router.post('/new_diary', paramVolidation, async (ctx, next) => {
  const user_id = ctx.session.user_id
  ctx.body = await newDiary(user_id, ctx.request.body)
})

// 删除日记
router.post('/del_diary', paramVolidation, async (ctx, next) => {
  const user_id = ctx.session.user_id
  ctx.body = await deleteDiary(user_id, ctx.request.body.diary_id)
})

/* 操作标签 */
// 新建标签
router.post('/new_label', paramVolidation, async (ctx) => {
  ctx.body = await newLabel(ctx.request.body.label_name)
})

// 更新标签
router.post('/update_label', paramVolidation, async (ctx) => {
  ctx.body = await updateLabel(ctx.request.body)
})

// 删除标签
router.post('/del_label', paramVolidation, async (ctx) => {
  ctx.body = await deleteLabel(ctx.request.body.label_id)
})

/* 操作分类 */
// 新建分类
router.post('/new_sort', paramVolidation, async (ctx) => {
  ctx.body = await newSort(ctx.request.body)
})

// 编辑分类
router.post('/update_sort', paramVolidation, async (ctx) => {
  ctx.body = await updateSort(ctx.request.body)
})

// 删除分类
router.post('/del_sort', paramVolidation, async (ctx) => {
  ctx.body = await deleteSort(ctx.request.body.sort_id)
})

/* 个人信息 */
// 修改个人信息
router.post('/update_user', paramVolidation, async (ctx) => {
  const user_id = ctx.session.user_id
  ctx.body = await updateUser(user_id, ctx.request.body)
})

/* 设置 */
// 设置默认用户头像
router.post('/set_avatar', paramVolidation, async (ctx) => {
  ctx.body = await addDefaultAvatar(ctx.request.body.images)
})

// 删除默认用户头像
router.post('/del_avatar', async (ctx) => {
  ctx.body = await deleteDefaultAvatar(ctx.request.body.id)
})

// 删除用户
router.post('/del_user', paramVolidation, async (ctx) => {
  ctx.body = await deleteUser(ctx.request.body.user_id)
})

module.exports = router