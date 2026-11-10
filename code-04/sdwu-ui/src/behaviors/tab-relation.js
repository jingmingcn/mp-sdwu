/**
 * 关系标识 behavior。
 *
 * relations 的 target 用 behavior 而不是相对路径字符串，
 * 好处：组件移动目录、被打成 npm 包后，关系依然成立。
 */
exports.TABS = Behavior({})
exports.TAB = Behavior({})
