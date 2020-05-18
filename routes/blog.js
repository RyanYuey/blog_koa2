const router = require('koa-router')()
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck') //登录验证中间件

router.prefix('/api/blog')

// 获取博客列表
router.get('/list', async (ctx, next) => {
  const author = ctx.query.author || '';
  const keyword = ctx.query.keyword || '';

  const listData = await getList(author, keyword);
  ctx.body = new SuccessModel(listData)
})

// 获取博客详情
router.get('/detail', async (ctx, next) => {
  const id = ctx.query.id;

  const data = await getDetail(id)
  ctx.body = new SuccessModel(data)
})

// 新建博客
router.post('/new', loginCheck, async (ctx, next) => {
  const blogData = ctx.request.body;
  blogData.author = ctx.session.username;

  const data = await newBlog(blogData)
  ctx.body = new SuccessModel(data)
})

// 更新博客
router.post('/update', loginCheck, async (ctx, next) => {
  const id = ctx.query.id
  const val = await updateBlog(id, ctx.request.body)
  if (val) {
    ctx.body = new SuccessModel('更新博客成功')
  } else {
    ctx.body = new ErrorModel('更新博客失败')
  }
})

// 删除博客
router.post('/delete', loginCheck, async (ctx, next) => {
  const author = ctx.session.username
  const id = ctx.query.id
  const result = await delBlog(id, author)
  if (result) {
    ctx.body = new SuccessModel('删除博客成功')
  } else {
    ctx.body = new ErrorModel('删除博客失败')
  }
})


module.exports = router