'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as LucideIcons from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">个人资料</h1>
        <p className="text-muted-foreground mt-2">管理您的个人信息</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.username}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">用户ID</p>
              <p className="font-medium">{user?._id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">角色</p>
              <p className="font-medium">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">状态</p>
              <p className="font-medium">{user?.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">最后登录</p>
              <p className="font-medium">
                {user?.last_login_at
                  ? new Date(user.last_login_at).toLocaleString('zh-CN')
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg border p-6">
        <div className="flex items-start gap-3">
          <LucideIcons.Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">功能开发中</p>
            <p className="text-sm text-muted-foreground mt-1">
              个人资料编辑功能正在开发中，敬请期待。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
