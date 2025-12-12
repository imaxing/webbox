import { apiRequest } from './request'
import { User, UserRole, UserStatus } from './auth'

// 重新导出类型供外部使用
export type { User, UserRole, UserStatus }

// 列表查询参数
export interface UserListParams {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
  search?: string
}

// 分页信息
export interface PagingInfo {
  next_page: number
  total: number
  last_page: number
  per_page: number
}

// 列表响应
export interface UserListResponse {
  data: User[]
  paging: PagingInfo
}

// 用户表单数据
export interface UserFormData {
  username: string
  email: string
  password?: string
  role: UserRole
  status: UserStatus
}

/**
 * 获取用户列表
 */
export const getUserList = (params?: UserListParams) => {
  return apiRequest<UserListResponse>({
    method: 'get',
    url: '/admin/users',
    params,
  })
}

/**
 * 获取单个用户
 */
export const getUserById = (id: string) => {
  return apiRequest<User>({
    method: 'get',
    url: `/admin/users/${id}`,
  })
}

/**
 * 创建用户
 */
export const createUser = (data: UserFormData) => {
  return apiRequest<User>({
    method: 'post',
    url: '/admin/users',
    data,
  })
}

/**
 * 更新用户
 */
export const updateUser = (id: string, data: Partial<UserFormData>) => {
  return apiRequest<User>({
    method: 'put',
    url: `/admin/users/${id}`,
    data,
  })
}

/**
 * 删除用户
 */
export const deleteUser = (id: string) => {
  return apiRequest<void>({
    method: 'delete',
    url: `/admin/users/${id}`,
  })
}

/**
 * 批量删除用户
 */
export const batchDeleteUsers = (ids: string[]) => {
  return apiRequest<void>({
    method: 'post',
    url: '/admin/users/batch-delete',
    data: { ids },
  })
}
