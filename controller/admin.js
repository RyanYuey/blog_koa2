const { exec, escape } = require('../db/mysql')
const xss = require('xss')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { handleUpdateParams } = require('../utils/common')

/**
  * 新建博客
  *@method newArticle    
  *@param {Number}    user_id  
  *@param  {Object}   options ctx.request.body
  *@return {Promise}
*/
const newArticle = async (user_id, { article_title, article_content, article_abstract, thumbnail, label_id = '', sort_id = '' }) => {
  const date = Date.now() //博客创建时间
  article_title = escape(article_title)
  article_content = escape(article_content)
  // 如果没有上传文章缩略图，设置默认的
  if (!thumbnail) {
    // 从数据库拿到默认图
    const rows = await exec('select * from default_img where d_type=1')
    thumbnail = rows[0].d_img
  }

  let sql = `insert into articles (article_title,article_content,article_abstract,thumbnail,user_id,create_time,update_time,label_id,sort_id) 
  values (${article_title},${article_content},'${article_abstract}','${thumbnail}',${user_id},${date},${date},'${label_id}','${sort_id}')`
  try {
    await exec(sql)
  } catch (error) {
    return new ErrorModel(error, '添加失败')
  }
  return new SuccessModel('添加成功')
}

/**
 * 更新博客
 * @method updateArticle
 * @param {Number} user_id 
 * @param {Object} options ctx.request.body
 * @return {Promise}
 */
const updateArticle = async (user_id, options) => {
  const { article_id } = options
  options['update_time'] = Date.now()  //更新时间
  if (!options.thumbnail) {
    // 从数据库拿到默认图
    const rows = await exec('select * from default_img where d_type=1')
    thumbnail = rows[0].d_img
  }
  const sql_str = handleUpdateParams(options)
  sql = `update articles set ${sql_str} where article_id=${article_id} and user_id=${user_id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('修改成功')
    }
    return new ErrorModel('修改失败')

  } catch (error) {
    return new ErrorModel(error, '修改失败')
  }
}

/**
 * 删除博客
 * @method deleteArticle
 * @param {Number} user_id
 * @param {Number} article_id
 * @return {Promise}
 */
const deleteArticle = async (user_id, article_id) => {

  let sql = `delete from articles where article_id=${article_id} and user_id=${user_id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('删除成功')
    }
    return new ErrorModel('删除失败')

  } catch (error) {
    return new ErrorModel(error, '删除失败')
  }
}

/**
 * 新建日记
 * @method newDiary
 * @param {Number} user_id
 * @param {Object} options ctx.request.body
 * @return {Promise}
 */
const newDiary = async (user_id, { content, diary_img = "" }) => {
  content = escape(content)
  const date = Date.now()
  let sql = `insert into diary (content,diary_img,user_id,create_time) values (${content}, '${diary_img}',${user_id},${date})`
  try {
    await exec(sql)
  } catch (error) {
    return new ErrorModel(error)
  }
  return new SuccessModel('添加成功')
}

/**
 * 删除日记
 * @method deleteDiary
 * @param {Number} user_id
 * @param {Number} diary_id 
 * @return {Promise}
 */
const deleteDiary = async (user_id, diary_id) => {
  let sql = `delete from diary where diary_id=${diary_id} and user_id=${user_id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('删除成功')
    }
    return new ErrorModel('删除失败')

  } catch (error) {
    return new ErrorModel(error, '删除失败')
  }
}

/**
 * 新建标签
 * @method newLabel
 * @param {String} label_name
 * @return {Promise}
 */
const newLabel = async (label_name) => {
  // label_name 可以是一个标签，也可以是多个标签
  let labelArr = label_name.split(',').map(label => {
    return `('${label}')`
  })
  const str = labelArr.join(',')

  let sql = `insert into labels (label_name) values ${str}`
  try {
    const { affectedRows, insertId } = await exec(sql)
    // 如果插入多条时，affectedRows：插入条数，insertId：插入第一条id
    let savedId = [] //用一个数组保存插入的id
    for (let i = 0; i < affectedRows; i++) {
      savedId.push(insertId + i)
    }
    return new SuccessModel({ label_id: savedId.join(',') }, '添加成功')
  } catch (error) {
    if (error.errno === 1062) {
      return new ErrorModel(error, '标签不能重复')
    }
    return new ErrorModel(error, '新建标签失败')
  }
}

/**
 * 更新标签
 * @method updateLabel
 * @param {Object} options
 * @return {Promise} 
 */
const updateLabel = async (options) => {
  const { label_id, label_name } = options

  let sql = `update labels set label_name='${label_name}' where label_id=${label_id}`

  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('修改成功')
    }
    return new ErrorModel('修改失败')

  } catch (error) {
    return new ErrorModel(error, '修改失败')
  }
}

/**
 * 删除标签
 * @method deleteLabel
 * @param {Number} label_id
 * @return {Promise}
 */
const deleteLabel = async (label_id) => {
  let sql = `delete from labels where label_id=${label_id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('删除成功')
    }
    return new ErrorModel('删除失败')

  } catch (error) {
    return new ErrorModel(error, '删除失败')
  }
}

/**
 * 新建分类
 * @method newSort
 * @param {Object} options
 * @return {Promise}
 */
const newSort = async ({ sort_name, parent_sort_id = 0 }) => {
  if (parent_sort_id) {
    // 需要判断父id存在
    let sql = `select * from sorts where sort_id=${parent_sort_id}`
    const rows = await exec(sql)
    if (rows.length === 0) {
      return new ErrorModel('父类Id不存在')
    }
  }

  // 插入数据
  sort_name = escape(sort_name)
  let sql = `insert into sorts (sort_name, parent_sort_id) values(${sort_name},${parent_sort_id})`
  try {
    await exec(sql)
    return new SuccessModel('添加成功')
  } catch (error) {
    if (error.errno === 1062) {
      return new ErrorModel(error, '分类不能重复')
    }
    return new ErrorModel(error)
  }
}

/**
 * 更新分类
 * @method updateSort
 * @param {Object} options 
 * @return {Promise}
 */
const updateSort = async (options) => {
  const { sort_id, parent_sort_id, sort_name } = options
  const obj = {
    sort_name
  }
  if (typeof parent_sort_id !== 'undefined') {
    obj.parent_sort_id = parent_sort_id
  }
  const sql_str = handleUpdateParams(obj)
  let sql = `update sorts set ${sql_str} where sort_id=${sort_id}`

  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('修改成功')
    }
    return new ErrorModel('修改失败')

  } catch (error) {
    return new ErrorModel(error, '修改失败')
  }
}

/**
 * 删除分类
 * @method deleteSort
 * @param {Number} sort_id
 * @return {Promise}
 */
const deleteSort = async (sort_id) => {
  let sql = `delete from sorts where sort_id=${sort_id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('删除成功')
    }
    return new ErrorModel('删除失败')

  } catch (error) {
    return new ErrorModel(error, '删除失败')
  }
}

/**
 * 修改个人信息
 * @method updateUser
 * @param {Number} user_id
 * @param {Object} options
 * @return {Promise}
 */
const updateUser = async (user_id, options) => {
  const sql_str = handleUpdateParams(options)
  sql = `update users set ${sql_str} where user_id=${user_id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('修改成功')
    }
    return new ErrorModel('修改失败')

  } catch (error) {
    return new ErrorModel(error, '修改失败')
  }
}

/**
 * 添加默认头像
 * @method addDefaultAvatar
 * @param {String} images
 * @return {Promise}
 */
const addDefaultAvatar = async (images) => {
  const imgArr = images.split(',')
  let values = []
  imgArr.forEach(img => {
    values.push(`('${img}',1)`)
  })

  let sql = `insert into images(href,type) values ${values.join(',')}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('修改成功')
    }
    return new ErrorModel('修改失败')
  } catch (error) {
    return new ErrorModel('添加失败')
  }
}

/**
 * 删除默认头像
 * @method deleteDefaultAvatar
 * @param {Number} id
 * @return {Promise}
 */
const deleteDefaultAvatar = async (id) => {
  let sql = `delete from images where id=${id}`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('删除成功')
    }
    return new ErrorModel('删除失败')
  } catch (error) {
    return new ErrorModel(error)
  }
}

/**
 * 删除用户
 * @method deleteUser
 * @param {Number} user_id
 * @return {Promise}
 */
const deleteUser = async (user_id) => {
  let sql = `delete from users where user_id=${user_id} and user_type=1`
  try {
    const result = await exec(sql)
    if (result.affectedRows > 0) {
      return new SuccessModel('删除成功')
    }
    return new ErrorModel('删除失败')
  } catch (error) {
    return new ErrorModel(error)
  }
}


module.exports = {
  newArticle,
  updateArticle,
  deleteArticle,
  newDiary,
  deleteDiary,
  newLabel,
  deleteLabel,
  newSort,
  deleteSort,
  updateUser,
  updateSort,
  updateLabel,
  addDefaultAvatar,
  deleteDefaultAvatar,
  deleteUser
}
