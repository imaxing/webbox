import { toast as sonnerToast } from 'sonner'

/**
 * Toast 通知工具函数
 * 基于 sonner 库封装，提供统一的通知接口
 */

export const toast = {
  /**
   * 成功提示
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 3000,
    })
  },

  /**
   * 错误提示
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 4000,
    })
  },

  /**
   * 警告提示
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 3000,
    })
  },

  /**
   * 信息提示
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
    })
  },

  /**
   * 加载提示
   */
  loading: (message: string) => {
    return sonnerToast.loading(message)
  },

  /**
   * 自定义提示
   */
  message: (message: string, description?: string) => {
    return sonnerToast(message, {
      description,
      duration: 3000,
    })
  },

  /**
   * 确认对话框
   * 返回 Promise<boolean>，用户点击确认返回 true，取消返回 false
   */
  confirm: (
    message: string,
    options?: {
      title?: string
      confirmText?: string
      cancelText?: string
      description?: string
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      sonnerToast(options?.title || '确认操作', {
        description: message,
        duration: Infinity,
        action: {
          label: options?.confirmText || '确认',
          onClick: () => resolve(true),
        },
        cancel: {
          label: options?.cancelText || '取消',
          onClick: () => resolve(false),
        },
      })
    })
  },

  /**
   * Promise 提示
   * 自动显示加载、成功、失败状态
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, options)
  },

  /**
   * 关闭所有提示
   */
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id)
  },
}
