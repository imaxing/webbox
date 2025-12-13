import { apiRequest } from "./request";

/**
 * 路由管理 API
 */

// 路由匹配类型
export type RouteType = "exact" | "wildcard" | "regex";

// 路由规则数据结构
export interface RouteRule {
  _id?: string;
  uuid?: string;
  pattern: string;
  type: RouteType;
  priority: number;
  enabled: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 列表查询参数
export interface RouteListParams {
  page?: number;
  limit?: number;
  sort?: string;
  pattern?: string;
  type?: RouteType;
  enabled?: boolean;
  [key: string]: any;
}

// 创建/更新路由数据
export interface RouteFormData {
  pattern: string;
  type: RouteType;
  priority?: number;
  enabled?: boolean;
  description?: string;
}

// 批量删除参数
export interface BatchDeleteParams {
  ids: string[];
}

// 分页信息
export interface PagingInfo {
  next_page: number;
  total: number;
  last_page: number;
  per_page: number;
}

// 列表响应数据结构
export interface RouteListResponse {
  data: RouteRule[];
  paging: PagingInfo;
}

// 路由列表
export const getRouteList = (params?: RouteListParams) => {
  return apiRequest<RouteListResponse>({
    method: "get",
    url: "/admin/routes",
    params,
  });
};

// 路由详情
export const getRouteInfo = (id: string) => {
  return apiRequest({
    method: "get",
    url: `/admin/routes/${id}`,
  });
};

// 创建路由
export const createRoute = (data: RouteFormData) => {
  return apiRequest({
    method: "post",
    url: "/admin/routes",
    data,
  });
};

// 更新路由
export const updateRoute = (id: string, data: Partial<RouteFormData>) => {
  return apiRequest({
    method: "put",
    url: `/admin/routes/${id}`,
    data,
  });
};

// 删除路由
export const deleteRoute = (id: string) => {
  return apiRequest({
    method: "delete",
    url: `/admin/routes/${id}`,
  });
};

// 批量删除路由
export const batchDeleteRoutes = (data: BatchDeleteParams) => {
  return apiRequest({
    method: "post",
    url: "/admin/routes/batch-delete",
    data,
  });
};

// 默认导出对象形式
export default {
  list: getRouteList,
  getInfo: getRouteInfo,
  create: createRoute,
  update: updateRoute,
  delete: deleteRoute,
  batchDelete: batchDeleteRoutes,
};
