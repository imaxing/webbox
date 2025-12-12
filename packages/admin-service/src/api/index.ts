/**
 * API 模块导出
 * 统一管理所有 API 接口
 *
 * 使用方式：
 * import api from '@/api';
 * api.user.list()
 * api.template.delete(id)
 */

import user from "./user";
import route from "./route";
import template from "./template";
import domain from "./domain";
import auth from "./auth";
import menu from "./menu";
import statistics from "./statistics";

const api = {
  user,
  route,
  template,
  domain,
  auth,
  menu,
  statistics,
};

export default api;

// 也可以单独导出
export { user, route, template, domain, auth, menu, statistics };
