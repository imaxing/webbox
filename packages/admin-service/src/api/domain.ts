import { apiRequest } from "./request";

/**
 * 域名管理 API
 */

// 域名状态
export type DomainStatus = "active" | "inactive";

// 路由-模板映射接口
export interface RouteTemplateMapping {
  route: string; // 路由规则 ID
  template: string; // 模板 ID
}

// 域名选项
export interface DomainOption {
  value: string;
  label: string;
  id: string;
}

// 列表查询参数
export interface DomainListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: DomainStatus;
  [key: string]: any;
}

// 域名表单数据
export interface DomainFormData {
  domain: string;
  app_name: string;
  email: string;
  project_group?: string; // 项目组
  status?: DomainStatus;
  config?: Record<string, any>;
  routes?: RouteTemplateMapping[]; // 路由-模板映射数组
}

// 域名数据接口
export interface Domain extends DomainFormData {
  _id: string;
  uuid: string;
  routes: RouteTemplateMapping[]; // 路由-模板映射数组（必填）
  createdAt: string;
  updatedAt?: string;
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
export interface DomainListResponse {
  data: any[];
  paging: PagingInfo;
}

// 获取域名选项列表
export const getDomainOptions = () => {
  return apiRequest<DomainOption[]>({
    method: "get",
    url: "/admin/domains/options",
  });
};

// 域名列表
export const getDomainList = (params?: DomainListParams) => {
  return apiRequest<DomainListResponse>({
    method: "get",
    url: "/admin/domains",
    params,
  });
};

// 域名详情
export const getDomainInfo = (id: string) => {
  return apiRequest({
    method: "get",
    url: `/admin/domains/${id}`,
  });
};

// 获取域名关联信息（模板、路由）
export const getDomainRelations = (id: string) => {
  return apiRequest({
    method: "get",
    url: `/admin/domains/${id}/relations`,
  });
};

// 创建域名
export const createDomain = (data: DomainFormData) => {
  return apiRequest({
    method: "post",
    url: "/admin/domains",
    data,
  });
};

// 更新域名
export const updateDomain = (id: string, data: Partial<DomainFormData>) => {
  return apiRequest({
    method: "put",
    url: `/admin/domains/${id}`,
    data,
  });
};

// 删除域名
export const deleteDomain = (id: string) => {
  return apiRequest({
    method: "delete",
    url: `/admin/domains/${id}`,
  });
};

// 批量删除域名
export const batchDeleteDomains = (data: BatchDeleteParams) => {
  return apiRequest({
    method: "post",
    url: "/admin/domains/batch-delete",
    data,
  });
};

// 默认导出对象形式
export default {
  options: getDomainOptions,
  list: getDomainList,
  getInfo: getDomainInfo,
  getRelations: getDomainRelations,
  create: createDomain,
  update: updateDomain,
  delete: deleteDomain,
  batchDelete: batchDeleteDomains,
};
