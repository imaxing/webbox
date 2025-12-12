/**
 * API 模块导出
 * 统一管理所有 API 接口
 */

import * as user from './user'
import * as route from './route'
import * as template from './template'
import * as domain from './domain'

export default {
  user,
  route,
  template,
  domain,
}

// 也可以单独导出
export { user, route, template, domain }
