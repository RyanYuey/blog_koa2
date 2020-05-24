const { exec, escape } = require('../db/mysql')
const xss = require('xss')
const { SuccessModel, ErrorModel } = require('../model/resModel')


/**
 * 获取日记列表
 * @method getDiaryList
 * @return {Promise}
 */
const getDiaryList = async () => {
  let sql = `select * from diary where 1=1 `
  sql += `order by create_time desc` // 时间倒序排序
  try {
    const rows = await exec(sql)
    return new SuccessModel(rows)
  } catch (error) {
    return new ErrorModel(error)
  }
}

/**
 * 获取标签列表
 * @method getLabelList
 * @return {Promise}
 */
const getLabelList = async () => {
  let sql = `select * from labels where 1=1`
  try {
    const rows = await exec(sql)
    return new SuccessModel(rows)
  } catch (error) {
    return new ErrorModel(error)
  }
}

/**
 * 获取分类列表
 * @method getSortList
 * @return {Promise}
 */
const getSortList = async () => {
  let sql = `select * from sorts where 1=1`
  try {
    const rows = await exec(sql)
    return new SuccessModel(rows)
  } catch (error) {
    return new ErrorModel(error)
  }
}

/**
 * 获取留言列表
 * @method getMessage
 * @return {Promise}
 */
const getMessage = async () => {
  let sql = `select * from comments where topic_type=2 `
  sql += `order by create_time`
  const rows = await exec(sql)
  return new SuccessModel(rows)
}

/**
  * 添加留言
  *@method newMessage     
  *@param  {Object}    user_info    用户信息
  *@param  {Object}    options    ctx.request.body
  *@return {Promise}   
*/
const newMessage = async (user_info, options) => {
  const create_time = Date.now()
  const { user_id, user_avatar, user_nickname } = user_info
  let { topic_type = 2, parent_id = 0, content, to_uid = 0 } = options
  content = escape(xss(content))
  let sql = ''
  // 如果评论目标是用户的话
  if (to_uid !== 0) {
    // 查询目标用户信息
    let sql_user = `select user_nickname,user_avatar from users where user_id=${to_uid}`
    const rows = await exec(sql_user)
    const to_nickname = rows[0].user_nickname
    const to_avatar = rows[0].user_avatar
    sql = `insert into comments (topic_type,parent_id,content,create_time,from_uid,from_nickname,from_avatar,to_uid,to_nickname,to_avatar) 
          values (${topic_type},${parent_id},${content},${create_time},${user_id},'${user_nickname}','${user_avatar}',${to_uid},'${to_nickname}','${to_avatar}')`
  } else {
    sql = `insert into comments (topic_type,parent_id,content,create_time,from_uid,from_nickname,from_avatar)
    values (${topic_type},${parent_id},${content},${create_time},${user_id},'${user_nickname}','${user_avatar}')`
  }
  try {
    const insertData = await exec(sql);
    return new SuccessModel({
      id: insertData.insertId
    })
  } catch (error) {
    return new ErrorModel(error)
  }
}

/**
 *  删除留言
 * @method deleteMessage
 * @param {Number} user_id 用户id
 * @param {Number} id ctx.request.body.id
 * @return {Promise}
 */
const deleteMessage = async (user_id, id) => {
  let sql = `delete from comments where id=${id} and from_uid=${user_id} or parent_id=${id}` //当前评论下的评论也要删除
  try {
    const updateData = await exec(sql)
    if (updateData.affectedRows > 0) {
      return new SuccessModel('删除成功')
    } else {
      return new ErrorModel('删除失败')
    }

  } catch (error) {
    return new ErrorModel(error, '删除失败')
  }
}

module.exports = {
  getDiaryList,
  getLabelList,
  getSortList,
  getMessage,
  newMessage,
  deleteMessage
}