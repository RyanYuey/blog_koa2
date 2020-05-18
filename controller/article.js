const { exec, escape } = require('../db/mysql')
const xss = require('xss')
const { SuccessModel, ErrorModel } = require('../model/resModel')

/**
  * 获取博客列表
  *@method getList     
  *@param  {String}   keyword 关键词
  *@param  {Number}   sort_id 分类id
  *@param  {Number}   page 分页
  *@param  {Number}   page_size 一页数量
  *@return {Promise}
*/
const getList = async (keyword, sort_id, page, page_size) => {
  let sql = `select SQL_CALC_FOUND_ROWS * from articles where 1=1 `

  // 根据分类模糊查询(因为一篇文章分类可能有好几个)
  if (sort_id) {
    sql += `and sort_id like '%${sort_id}%' `
  }
  // 根据关键词模糊查询
  if (keyword) {
    keyword = xss(keyword) //过滤sql注入和xss攻击

    sql += `and article_title like '%${keyword}%' `
  }
  sql += `order by update_time desc limit ${(page - 1) * page_size},${page_size}` // 时间倒序排序
  try {
    const rows = await exec(sql)
    // 查询所有数据数量
    // let sql2 = `select count(*) as total from articles`
    let sql2 = `SELECT FOUND_ROWS() as total`

    const [{ total }] = await exec(sql2)
    return new SuccessModel({
      list: rows,
      total: total
    })
  } catch (error) {
    return new ErrorModel(error)
  }

}

/**
 * 获取热门文章列表
 * @method getHotArticles
 * @return {Promise}
 */
const getHotArticles = async () => {
  let sql = `select * from articles order by article_view_count desc limit 5`
  try {
    const rows = await exec(sql)
    return new SuccessModel(rows)
  } catch (error) {
    return new ErrorModel(error)
  }
}

/**
  * 获取博客详情
  *@method getDetail     
  *@param  {Number}    id    博客id
  *@return {Promise}   
*/
const getDetail = async (id) => {
  let sql = `select * from articles where article_id=${id}`
  const rows = await exec(sql)
  const data = rows[0]

  // 查询作者信息
  if (data.user_id) {
    let user_sql = `select user_nickname,user_avatar from users where user_id=${data.user_id}`
    const users = await exec(user_sql)
    data['user_avatar'] = users[0].user_avatar
    data['user_nickname'] = users[0].user_nickname
  }


  let view_count = data.article_view_count + 1; //文章浏览量加一
  sql = `update articles set article_view_count=${view_count} where article_id=${id}`
  await exec(sql)
  return data || {}
}

/**
  * 文章点赞
  *@method setArticleLike     
  *@param  {String}    ip    用户ip
  *@param  {Number}    article_id    文章id
  *@param  {Number}    like_status   喜欢状态 1= 喜欢 2= 不喜欢
  *@return {Boolean}   是否修改成功
*/
const setArticleLike = async (ip, article_id, like_status) => {
  let result;
  // 查询数据库，获取喜欢文章的所有ip
  let sql = `select * from article_like where article_id=${article_id}`
  const like_rows = await exec(sql)
  // 判断用户ip是否存在
  const ip_exist = like_rows.some(item => item.user_ip == ip)
  // 如果ip不存在 且用户点赞
  if (!ip_exist && like_status == 1) {
    sql = `insert into article_like (user_ip, article_id, like_status) values ('${ip}', ${article_id}, ${like_status})`
    await exec(sql);
    result = true
  }

  // 如果ip存在 -> 点赞 || 取消点赞
  if (ip_exist) {

    sql = `update article_like set like_status=${like_status} where user_ip='${ip}'`
    const updateData = await exec(sql)
    if (updateData.affectedRows > 0) {
      result = true
    } else {
      result = false
    }
  }

  // 最后查询点赞数量，更新文章表中点赞数量
  sql = `select * from article_like where article_id=${article_id}`
  const rows = await exec(sql)
  const like_count = rows.length
  // 更新文章表
  sql = `update articles set article_like_count=${like_count} where article_id=${article_id}`
  exec(sql)

  return result
}

/**
 * 获取评论列表
 * @method getCommentList
 * @param {Number} topic_type 
 * @param {Number} topic_id
 * @return {Promise}
 */
const getCommentList = async (topic_type = 1, topic_id) => {
  let sql = `select * from comments where topic_type=${topic_type} `
  if (topic_id) {
    sql += `and topic_id=${topic_id} `
  }
  sql += `order by create_time`
  const rows = await exec(sql)
  return new SuccessModel(rows)
}

/**
  * 文章发表评论
  *@method setComment     
  *@param  {Object}    user_info    用户信息
  *@param  {Object}    options    ctx.request.body
  *@return {Promise}   
*/
const setComment = async (user_info, options) => {
  const create_time = Date.now()
  const { user_id, user_avatar, user_nickname } = user_info
  let { topic_id, topic_type = 1, parent_id = 0, content, to_uid = 0 } = options
  content = escape(xss(content))
  let sql = ''
  // 如果评论目标是用户的话
  if (to_uid !== 0) {
    // 查询目标用户信息
    let sql_user = `select user_nickname,user_avatar from users where user_id=${to_uid}`
    const rows = await exec(sql_user)
    const to_nickname = rows[0].user_nickname
    const to_avatar = rows[0].user_avatar
    sql = `insert into comments (topic_id,topic_type,parent_id,content,create_time,from_uid,from_nickname,from_avatar,to_uid,to_nickname,to_avatar) 
          values (${topic_id},${topic_type},${parent_id},${content},${create_time},${user_id},'${user_nickname}','${user_avatar}',${to_uid},'${to_nickname}','${to_avatar}')`
  } else {
    sql = `insert into comments (topic_id,topic_type,parent_id,content,create_time,from_uid,from_nickname,from_avatar)
    values (${topic_id},${topic_type},${parent_id},${content},${create_time},${user_id},'${user_nickname}','${user_avatar}')`
  }
  const insertData = await exec(sql);

  // 查询文章评论数量，更新文章表中评论数量
  sql = `select * from comments where topic_id=${topic_id}`
  const rows = await exec(sql)
  const comment_count = rows.length
  console.log(rows.length)
  // 更新文章表
  sql = `update articles set article_comment_count=${comment_count} where article_id=${topic_id}`
  exec(sql)

  return {
    id: insertData.insertId
  }
}

/**
 *  删除评论
 * @method deleteComment
 * @param {Number} user_id 用户id
 * @param {Object} options ctx.request.body
 * @return {Promise}
 */
const deleteComment = async (user_id, { id, article_id }) => {
  let result
  let sql = `delete from comments where id=${id} and from_uid=${user_id} or parent_id=${id}` //当前评论下的评论也要删除
  const updateData = await exec(sql)
  if (updateData.affectedRows > 0) {
    result = true
  } else {
    result = false
  }

  // 查询评论表，更改文章表
  sql = `select * from comments where topic_id=${article_id}`
  const rows = await exec(sql)
  const comment_count = rows.length
  // 更新文章表
  sql = `update articles set article_comment_count=${comment_count} where article_id=${article_id}`
  exec(sql)

  return result
}

/**
 * 获取延申阅读数据
 * @method getFurtherReading
 * @param {Number} id
 * @return {Promise}
 */
const getFurtherReading = async (id) => {
  console.log(id)
  const sql = `select article_id, article_title from articles where 1=1`
  const rows = await exec(sql)
  const curIndex = rows.findIndex(item => item.article_id == id)
  const _data = {
    before: {
      id: rows[curIndex - 1] ? rows[curIndex - 1].article_id : -1,
      title: rows[curIndex - 1] ? rows[curIndex - 1].article_title : '咦，前面已经没有了'
    },
    after: {
      id: rows[curIndex + 1] ? rows[curIndex + 1].article_id : -1,
      title: rows[curIndex + 1] ? rows[curIndex + 1].article_title : '哇，你已经看完了'
    },
  }
  return new SuccessModel(_data)
}

module.exports = {
  getList,
  getDetail,
  setArticleLike,
  setComment,
  deleteComment,
  getFurtherReading,
  getCommentList,
  getHotArticles
}
