'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  login as apiLogin,
  logout as apiLogout,
  saveToken,
  saveUserInfo,
  getUserInfo,
  getToken,
  isAuthenticated,
  type User,
  type LoginRequest,
} from '@/api/auth';
import { toast } from '@/lib/toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化时检查登录状态
  useEffect(() => {
    // 确保在客户端环境
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const token = getToken();
        console.log('[AuthContext] 初始化认证，token:', token ? '存在' : '不存在');

        if (token) {
          const savedUser = getUserInfo();
          console.log('[AuthContext] 本地用户信息:', savedUser ? '存在' : '不存在');

          if (savedUser) {
            // 有本地缓存的用户信息，直接使用
            setUser(savedUser);
            console.log('[AuthContext] 使用本地缓存的用户信息');
          } else {
            // 有 token 但没有用户信息，从服务器获取
            console.log('[AuthContext] 从服务器获取用户信息');
            try {
              const { getCurrentUser } = await import('@/api/auth');
              const userData = await getCurrentUser();
              console.log('[AuthContext] 获取用户信息成功:', userData);
              setUser(userData);
              saveUserInfo(userData);
            } catch (error) {
              console.error('[AuthContext] 获取用户信息失败，清除 token:', error);
              // Token 无效，清除
              const { logout: clearAuth } = await import('@/api/auth');
              clearAuth();
            }
          }
        } else {
          console.log('[AuthContext] 无 token，未认证状态');
        }
      } catch (error) {
        console.error('[AuthContext] 初始化认证失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiLogin(credentials);

      // 保存 token 和用户信息
      saveToken(response.token);
      saveUserInfo(response.user);
      setUser(response.user);

      toast.success('登录成功');

      // 跳转到首页
      router.push('/');
    } catch (error: any) {
      console.error('登录失败:', error);
      toast.error(error.message || '登录失败，请检查用户名和密码');
      throw error;
    }
  };

  // 登出
  const logout = () => {
    apiLogout();
    setUser(null);
    toast.success('已退出登录');
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
