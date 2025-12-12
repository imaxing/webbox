import request, { RequestConfig } from '@/lib/request'

/**
 * API请求封装
 * 统一的API请求函数，提供类型安全
 */
export const apiRequest = <T = any>(config: RequestConfig): Promise<T> => {
  return request<T>(config)
}

export default apiRequest
