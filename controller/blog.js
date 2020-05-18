const { exec, escape } = require('../db/mysql')
const xss = require('xss')
// 获取博客列表
const getList = async (author, keyword) => {
  let sql = `select * from blogs where 1=1 `
  if (author) {
    sql += `and author='${author}' `
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }
  sql += `order by createtime desc`
  // 返回promise
  return await exec(sql)

}

// 获取博客详情
const getDetail = async (id) => {
  let sql = `select * from blogs where id=${id}`
  const rows = await exec(sql)
  return rows[0]
}

// 新建博客
const newBlog = async (blogData = {}) => {
  const title = escape(xss(blogData.title));
  const content = escape(xss(blogData.content));
  const author = blogData.author;
  const createtime = Date.now();
  let sql = `
            insert into blogs (title, content, author, createtime) 
            values (${title}, ${content}, '${author}', '${createtime}')
            `;
  const insertData = await exec(sql);
  return {
    id: insertData.insertId
  }
}

// 更新博客
const updateBlog = async (id, blogData = {}) => {
  const title = escape(xss(blogData.title));
  const content = escape(xss(blogData.content));
  let sql = `update blogs set title=${title}, content=${content} where id=${id}`;
  const updateData = await exec(sql);
  if (updateData.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
}

// 删除博客
const delBlog = async (id, author) => {
  let sql = `delete from blogs where id=${id} and author='${author}'`;
  const delData = await exec(sql);
  if (delData.affectedRows > 0) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}