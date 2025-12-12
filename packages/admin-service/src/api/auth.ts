import { apiRequest } from './request'

// 常量定义
const TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'
const TOKEN_EXPIRES_DAYS = 7 // token有效期7天

// 安全的浏览器环境检查
const isBrowser = typeof window !== 'undefined'

// 用户角色类型
export type UserRole = 'admin' | 'editor' | 'viewer'

// 用户状态类型
export type UserStatus = 'active' | 'inactive' | 'suspended'

// 用户信息接口
export interface User {
  _id: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  last_login_at?: string
  last_login_ip?: string
}

// 登录请求数据
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponse {
  user: User
  token: string
}

// 注册请求数据
export interface RegisterRequest {
  username: string
  email: string
  password: string
  role?: UserRole
}

/**
 * 用户登录
 */
export const login = (data: LoginRequest) => {
  return apiRequest<LoginResponse>({
    method: 'post',
    url: '/auth/login',
    data,
  })
}

/**
 * 用户注册
 */
export const register = (data: RegisterRequest) => {
  return apiRequest<LoginResponse>({
    method: 'post',
    url: '/auth/register',
    data,
  })
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return apiRequest<User>({
    method: 'get',
    url: '/admin/auth/me',
  })
}

/**
 * 用户登出（清除token和用户信息）
 */
export const logout = () => {
  if (!isBrowser) return

  // 清除cookie
  document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`

  // 清除localStorage
  try {
    localStorage.removeItem(USER_INFO_KEY)
  } catch (e) {
    console.error('清除用户信息失败:', e)
  }
}

/**
 * 保存token到cookie
 */
export const saveToken = (token: string) => {
  if (!isBrowser) return

  const expires = new Date()
  expires.setDate(expires.getDate() + TOKEN_EXPIRES_DAYS)
  document.cookie = `${TOKEN_KEY}=${token}; expires=${expires.toUTCString()}; path=/`
}

/**
 * 获取保存的token
 */
export const getToken = (): string | null => {
  if (!isBrowser) return null

  const name = TOKEN_KEY + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

/**
 * 保存用户信息到localStorage
 */
export const saveUserInfo = (user: User) => {
  if (!isBrowser) return

  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('保存用户信息失败:', e)
  }
}

/**
 * 获取保存的用户信息
 */
export const getUserInfo = (): User | null => {
  if (!isBrowser) return null

  try {
    const data = localStorage.getItem(USER_INFO_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('获取用户信息失败:', e)
    return null
  }
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}
