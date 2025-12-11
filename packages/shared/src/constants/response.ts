/**
 * 响应状态码常量
 * 业务状态码（非HTTP状态码）
 */
export const ResponseCode = {
  // 成功
  SUCCESS: 1003,

  // 客户端错误 (1004-1099)
  BAD_REQUEST: 1004,
  NOT_FOUND: 1005,
  DUPLICATE_KEY: 1007,

  // 认证错误 (1008-1020)
  UNAUTHORIZED: 1008, // 未认证（缺少或无效 Token）
  TOKEN_INVALID: 1009, // Token 无效或过期
  USER_NOT_FOUND: 1010, // 用户不存在
  USER_INACTIVE: 1011, // 用户账号被禁用
  FORBIDDEN: 1012, // 权限不足
  LOGIN_FAILED: 1013, // 登录失败（用户名或密码错误）

  // 服务器错误 (1006, 1100+)
  INTERNAL_ERROR: 1006
} as const;

/**
 * 响应消息常量
 */
export const ResponseMessage = {
  // 成功消息
  SUCCESS: '',
  OPERATION_SUCCESS: '操作成功',
  CREATED_SUCCESS: '创建成功',
  UPDATED_SUCCESS: '更新成功',
  DELETED_SUCCESS: '删除成功',

  // 通用错误
  BAD_REQUEST: '请求参数错误',
  NOT_FOUND: '资源不存在',
  INTERNAL_ERROR: '服务器内部错误',
  DUPLICATE_KEY: '数据已存在，请勿重复创建',

  // 认证相关
  AUTH: {
    MISSING_TOKEN: '缺少授权信息或授权信息无效',
    TOKEN_INVALID: 'Token 无效或已过期',
    USER_NOT_FOUND: '用户不存在',
    USER_INACTIVE: '用户账号已被停用或封禁',
    INSUFFICIENT_PERMISSIONS: '权限不足',
    LOGIN_FAILED: '用户名或密码错误',
    REGISTER_SUCCESS: '注册成功',
    LOGIN_SUCCESS: '登录成功',
    LOGOUT_SUCCESS: '退出成功'
  },

  // 用户管理
  USER: {
    CREATED: '用户创建成功',
    UPDATED: '用户更新成功',
    DELETED: '用户删除成功',
    USERNAME_EXISTS: '用户名已存在',
    EMAIL_EXISTS: '邮箱已存在',
    PASSWORD_TOO_SHORT: '密码长度至少为 6 位',
    USERNAME_TOO_SHORT: '用户名长度必须在 3-50 个字符之间',
    INVALID_EMAIL: '邮箱格式不正确',
    INVALID_ROLE: '角色无效，必须是以下之一：admin、editor、viewer'
  },

  // 域名管理
  DOMAIN: {
    CREATED: '域名创建成功',
    UPDATED: '域名更新成功',
    DELETED: '域名删除成功',
    NOT_FOUND: '域名不存在'
  },

  // 模板管理
  TEMPLATE: {
    CREATED: '模板创建成功',
    UPDATED: '模板更新成功',
    DELETED: '模板删除成功',
    COPIED: '模板复制成功',
    NOT_FOUND: '模板不存在'
  },

  // 路由管理
  ROUTE: {
    CREATED: '路由创建成功',
    UPDATED: '路由更新成功',
    DELETED: '路由删除成功',
    NOT_FOUND: '路由不存在'
  },

  // 缓存管理
  CACHE: {
    CLEARED: '缓存清除成功',
    CLEAR_ALL: '所有缓存已清除'
  }
} as const;
