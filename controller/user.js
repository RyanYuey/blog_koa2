const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/crypto')
const { SuccessModel, ErrorModel } = require('../model/resModel')

/**
 * 登录
 * @method login
 * @param {String} username 用户名
 * @param {String} password 密码
 * @return {Promise}
 */
const login = async (username, password) => {
  // 密码加密
  password = genPassword(password)

  // 防止sql注入
  username = escape(username)
  password = escape(password)

  // 先用用户名登录
  let sql = `select user_id,user_name, user_email, user_avatar, user_nickname,user_type from users where user_name=${username} and user_password=${password}`
  let rows = await exec(sql)
  // 如果没有查询到用户，换成邮箱登录
  if (rows.length === 0) {
    sql = `select user_id,user_name, user_email, user_avatar, user_nickname,user_type from users where user_email=${username} and user_password=${password}`
    rows = await exec(sql)
  }
  return rows[0] || {}
}

/**
 * 注册
 * @method register
 * @param {Object} options ctx.request.body
 * @return {Promise}
 */
const register = async ({ user_name, user_password, user_email, user_avatar, user_nickname, user_ip }) => {
  // 密码加密
  user_password = genPassword(user_password)

  // 防止sql注入
  user_name = escape(user_name)
  user_password = escape(user_password)
  user_email = escape(user_email)
  user_nickname = escape(user_nickname)

  const date = Date.now()

  // 如果没有头像，设置默认头像
  if (!user_avatar) {
    user_avatar = 'images/dafault_avatar.jpg'
  }

  // 验证用户名是否重复
  let sql = `select * from users where user_name=${user_name}`
  let rows = await exec(sql)
  if (rows.length > 0) {
    return new ErrorModel('用户名已存在')
  }
  // 验证邮箱是否重复
  sql = `select * from users where user_email=${user_email}`
  rows = await exec(sql)
  if (rows.length > 0) {
    return new ErrorModel('邮箱已经被注册')
  }

  // 插入新用户
  sql = `insert into users (user_name,user_password, user_email,user_avatar,user_ip,user_registration_time,user_nickname) 
      values(${user_name},${user_password},${user_email},'${user_avatar}','${user_ip}',${date},${user_nickname})`
  await exec(sql)
  return new SuccessModel('注册成功')
}

module.exports = {
  login,
  register
}