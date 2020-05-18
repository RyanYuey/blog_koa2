const { escape } = require('../db/mysql')
/**
   * 处理更新数据接口参数
   * @method handleUpdateParams
   * @param {Object} options 一个保存参数的对象 比如ctx.request.body
   * @return {String} 返回一段可拼接在sql语句中的字符串
   * 
   */
const handleUpdateParams = (options) => {
  // 遍历对象
  let array = []
  for (let key in options) {
    if (typeof options[key] === "string") {
      options[key] = escape(options[key])
    }
    let str = `${key}=${options[key]}`
    array.push(str)
  }
  return array.join(',')
}
module.exports = {
  handleUpdateParams
}