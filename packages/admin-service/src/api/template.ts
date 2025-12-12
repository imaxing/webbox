import { apiRequest } from './request'

/**
 * 模板管理 API
 */

// 模板分类
export type TemplateCategory = 'policy' | 'terms' | 'safety' | 'other'

// 模板变量类型
export type VariableType = 'text' | 'email' | 'url' | 'image'

// 自定义模板状态
export type CustomTemplateStatus = 'draft' | 'active' | 'archived'

// 模板变量定义
export interface TemplateVariable {
  name: string
  type: VariableType
  required: boolean
  default_value: string
  description: string
}

// 基础模板数据结构
export interface BaseTemplate {
  _id?: string
  uuid?: string
  name: string
  display_name: string
  category: TemplateCategory
  content: string
  variables: TemplateVariable[]
  description?: string
  createdAt?: string
  updatedAt?: string
}

// 自定义模板数据结构
export interface CustomTemplate {
  _id?: string
  name: string
  display_name: string
  domain: string
  base_template_id: string
  content: string
  variables: Record<string, string>
  status: CustomTemplateStatus
  version: number
  created_by?: string
  createdAt?: string
  updatedAt?: string
}

// 列表查询参数
export interface TemplateListParams {
  page?: number
  limit?: number
  sort?: string
  name?: string
  category?: TemplateCategory
  domain?: string
  status?: CustomTemplateStatus
  [key: string]: any
}

// 分页信息
export interface PagingInfo {
  next_page: number
  total: number
  last_page: number
  per_page: number
}

// 列表响应数据结构
export interface ListResponse<T> {
  data: T[]
  paging: PagingInfo
}

// 基础模板表单数据
export interface BaseTemplateFormData {
  name: string
  display_name: string
  category: TemplateCategory
  content: string
  variables?: TemplateVariable[]
  description?: string
}

// 自定义模板表单数据
export interface CustomTemplateFormData {
  name: string
  display_name: string
  domain: string
  base_template_id: string
  content: string
  variables?: Record<string, string>
  status?: CustomTemplateStatus
  version?: number
  created_by?: string
}

// 模板复制参数
export interface TemplateCopyParams {
  baseTemplateId: string
  name: string
  variables?: Record<string, string>
}

// 批量删除参数
export interface BatchDeleteParams {
  ids: string[]
}

// 选项数据结构
export interface TemplateOption {
  value: string
  label: string
  domain?: string
}

/**
 * 基础模板 API
 */

// 获取基础模板选项列表
export const getBaseTemplateOptions = () => {
  return apiRequest<TemplateOption[]>({
    method: 'get',
    url: '/admin/base-templates/options',
  })
}

// 基础模板列表
export const getBaseTemplateList = (params?: TemplateListParams) => {
  return apiRequest<ListResponse<BaseTemplate>>({
    method: 'get',
    url: '/admin/base-templates',
    params,
  })
}

// 基础模板详情
export const getBaseTemplateInfo = (id: string) => {
  return apiRequest<BaseTemplate>({
    method: 'get',
    url: `/admin/base-templates/${id}`,
  })
}

// 创建基础模板
export const createBaseTemplate = (data: BaseTemplateFormData) => {
  return apiRequest<BaseTemplate>({
    method: 'post',
    url: '/admin/base-templates',
    data,
  })
}

// 更新基础模板
export const updateBaseTemplate = (
  id: string,
  data: Partial<BaseTemplateFormData>
) => {
  return apiRequest<BaseTemplate>({
    method: 'put',
    url: `/admin/base-templates/${id}`,
    data,
  })
}

// 删除基础模板
export const deleteBaseTemplate = (id: string) => {
  return apiRequest<void>({
    method: 'delete',
    url: `/admin/base-templates/${id}`,
  })
}

// 批量删除基础模板
export const batchDeleteBaseTemplates = (data: BatchDeleteParams) => {
  return apiRequest<void>({
    method: 'post',
    url: '/admin/base-templates/batch-delete',
    data,
  })
}

/**
 * 自定义模板 API
 */

// 获取自定义模板选项列表
export const getCustomTemplateOptions = (params?: { domain?: string }) => {
  return apiRequest<TemplateOption[]>({
    method: 'get',
    url: '/admin/custom-templates/options',
    params,
  })
}

// 自定义模板列表
export const getCustomTemplateList = (params?: TemplateListParams) => {
  return apiRequest<ListResponse<CustomTemplate>>({
    method: 'get',
    url: '/admin/custom-templates',
    params,
  })
}

// 自定义模板详情
export const getCustomTemplateInfo = (id: string) => {
  return apiRequest<CustomTemplate>({
    method: 'get',
    url: `/admin/custom-templates/${id}`,
  })
}

// 创建自定义模板
export const createCustomTemplate = (data: CustomTemplateFormData) => {
  return apiRequest<CustomTemplate>({
    method: 'post',
    url: '/admin/custom-templates',
    data,
  })
}

// 更新自定义模板
export const updateCustomTemplate = (
  id: string,
  data: Partial<CustomTemplateFormData>
) => {
  return apiRequest<CustomTemplate>({
    method: 'put',
    url: `/admin/custom-templates/${id}`,
    data,
  })
}

// 删除自定义模板
export const deleteCustomTemplate = (id: string) => {
  return apiRequest({
    method: 'delete',
    url: `/admin/custom-templates/${id}`,
  })
}

// 批量删除自定义模板
export const batchDeleteCustomTemplates = (data: BatchDeleteParams) => {
  return apiRequest({
    method: 'post',
    url: '/admin/custom-templates/batch-delete',
    data,
  })
}

/**
 * 模板复制 API
 */

// 复制模板（基础模板 → 自定义模板）
export const copyTemplate = (data: TemplateCopyParams) => {
  return apiRequest<CustomTemplate>({
    method: 'post',
    url: '/admin/templates/copy',
    data,
  })
}
