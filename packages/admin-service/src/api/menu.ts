import { apiRequest } from "./request";
import type { MenuPayload } from "@webbox/shared";

export type { MenuItem } from "@webbox/shared";

/**
 * 获取菜单配置
 */
export const getMenus = () => {
  return apiRequest<MenuPayload>({
    method: "get",
    url: "/admin/menus",
  }).then((payload) => payload.items);
};

// 默认导出对象形式
export default {
  getMenus,
};
