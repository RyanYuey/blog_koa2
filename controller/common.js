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

module.exports = {
  getDiaryList,
  getLabelList,
  getSortList
}