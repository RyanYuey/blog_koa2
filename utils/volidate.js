/* 
  ajax请求参数验证
*/
const Joi = require('joi')
// 方案名要和接口照应，'/' 换成 '_'
const schemaObj = {
  _api_user_register: Joi.object().keys({
    user_name: Joi.string().min(3).max(20).required(),
    user_password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/),
    user_email: Joi.string().email().optional(),
    user_nickname: Joi.string().min(3).max(20).required(),
    user_avatar: Joi.optional()
  }),
  _api_user_login: Joi.object().keys({
    user_name: Joi.string().min(3).max(20).required(),
    user_password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/)
  }),
  _api_article_like: Joi.object().keys({
    like_status: Joi.required(),
    article_id: Joi.required(),
  }),
  _api_article_comment: Joi.object().keys({
    topic_id: Joi.optional(),
    topic_type: Joi.optional(),
    parent_id: Joi.optional(),
    content: Joi.string().required(),
    to_uid: Joi.optional(),
  }),
  _api_article_del_comment: Joi.object().keys({
    id: Joi.required(),
    article_id: Joi.optional(),
  }),
  _api_admin_new_article: Joi.object().keys({
    article_title: Joi.string().required(),
    article_content: Joi.string().required(),
    article_abstract: Joi.string().required(),
    thumbnail: Joi.optional(),
    label_id: Joi.optional(),
    sort_id: Joi.optional()
  }),
  _api_admin_update_article: Joi.object().keys({
    article_title: Joi.string().required(),
    article_content: Joi.string().required(),
    article_abstract: Joi.string().required(),
    thumbnail: Joi.optional(),
    article_id: Joi.required(),
    label_id: Joi.optional(),
    sort_id: Joi.optional()
  }),
  _api_admin_del_article: Joi.object().keys({
    article_id: Joi.required()
  }),
  _api_admin_new_diary: Joi.object().keys({
    content: Joi.required(),
    diary_img: Joi.optional()
  }),
  _api_admin_del_diary: Joi.object().keys({
    diary_id: Joi.required()
  }),
  _api_admin_new_label: Joi.object().keys({
    label_name: Joi.string().required()
  }),
  _api_admin_update_label: Joi.object().keys({
    label_name: Joi.string().required(),
    label_id: Joi.required()
  }),
  _api_admin_del_label: Joi.object().keys({
    label_id: Joi.required(),
  }),
  _api_admin_new_sort: Joi.object().keys({
    sort_name: Joi.string().required(),
    parent_sort_id: Joi.optional()
  }),
  _api_admin_update_sort: Joi.object().keys({
    sort_name: Joi.required(),
    sort_id: Joi.required(),
    parent_sort_id: Joi.optional()
  }),
  _api_admin_del_sort: Joi.object().keys({
    sort_id: Joi.required(),
  }),
  _api_admin_update_user: Joi.object().keys({
    user_name: Joi.string().min(3).max(20),
    user_email: Joi.string().email(),
    user_nickname: Joi.string().min(3).max(20),
    user_avatar: Joi.optional()
  }).or('user_name', 'user_email', 'user_nickname', 'user_avatar'),
  _api_admin_set_avatar: Joi.object().keys({
    images: Joi.string().required()
  }),
  _api_admin_del_user: Joi.object().keys({
    user_id: Joi.required()
  })
}
module.exports = schemaObj
