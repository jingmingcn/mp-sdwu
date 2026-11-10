/**
 * 订阅消息模板字段格式校验。
 * 格式不符时微信会返回 47003 —— 与其上线才发现，不如本地就拦下。
 */
const RULES = {
  thing:            v => /^[\s\S]{1,20}$/.test(v),
  character_string: v => /^[A-Za-z0-9\-_.]{1,32}$/.test(v),
  amount:           v => /^[¥￥$]?\d{1,10}(\.\d{1,2})?$/.test(v),
  time:             v => /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(v) ||
                         /^\d{4}年\d{1,2}月\d{1,2}日/.test(v),
  phrase:           v => /^[一-龥]{1,5}$/.test(v),
  number:           v => /^\d+(\.\d+)?$/.test(v),
  date:             v => /^\d{4}-\d{2}-\d{2}$/.test(v),
  name:             v => /^[\s\S]{1,10}$/.test(v)
}

/**
 * TODO-15: 实现校验器
 *   字段名形如 thing2 / amount3 —— 取出类型前缀后用 RULES 校验
 *   返回 { ok, errors: [{ field, type, value, reason }] }
 */
function validate(data) {
  return { ok: true, errors: [] }
}

module.exports = { validate, RULES }
