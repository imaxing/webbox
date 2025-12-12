import { apiRequest } from './request'

// 菜单项类型
export interface MenuItem {
  name: string
  icon: string
  path?: string
  subItems?: SubMenuItem[]
}

// 子菜单项类型
export interface SubMenuItem {
  name: string
  path: string
  pro?: boolean
  new?: boolean
}

// 菜单配置类型
export interface MenuConfig {
  main: MenuItem[]
  others: MenuItem[]
}

/**
 * 获取菜单配置
 */
export const getMenus = () => {
  return apiRequest<MenuConfig>({
    method: 'get',
    url: '/admin/menus',
  })
}
