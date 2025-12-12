'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AntInput, AntButton } from '@/components';
import { Label } from '@/components/label';
import { useAuth } from '@/contexts/AuthContext';
import * as LucideIcons from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    setLoading(true);
    try {
      await login({ username, password });
    } catch (error) {
      // 错误已在 AuthContext 中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo 和标题 */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <LucideIcons.Box className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">欢迎回来</h1>
          <p className="text-muted-foreground mt-2">
            登录到 Webbox 管理后台
          </p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <AntInput
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                prefix={<LucideIcons.User className="h-4 w-4 text-muted-foreground" />}
                disabled={loading}
                size="large"
              />
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <AntInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  prefix={<LucideIcons.Lock className="h-4 w-4 text-muted-foreground" />}
                  disabled={loading}
                  size="large"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <LucideIcons.EyeOff className="h-4 w-4" />
                  ) : (
                    <LucideIcons.Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 记住我 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-muted-foreground">
              记住我
            </label>
          </div>

          {/* 登录按钮 */}
          <AntButton
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            disabled={!username || !password || loading}
          >
            {loading ? '登录中...' : '登录'}
          </AntButton>
        </form>

        {/* 提示信息 */}
        <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <LucideIcons.Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">演示说明</p>
              <ul className="space-y-1 text-xs">
                <li>• 请使用 API 服务创建的账号登录</li>
                <li>• API 地址: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}</li>
                <li>• 登录成功后将跳转到管理后台</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
