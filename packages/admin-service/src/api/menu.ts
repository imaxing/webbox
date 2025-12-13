import { apiRequest } from "./request";

// 菜单项类型
export interface MenuItem {
  name: string;
  icon: string;
  path?: string;
  subItems?: SubMenuItem[];
}

// 子菜单项类型
export interface SubMenuItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

/**
 * 获取菜单配置
 */
export const getMenus = () => {
  return apiRequest<MenuItem[]>({
    method: "get",
    url: "/admin/menus",
  });
};

// 默认导出对象形式
export default {
  getMenus,
};
