'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground mt-2">管理系统设置和偏好</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <LucideIcons.Palette className="h-5 w-5" />
            <h2 className="text-lg font-semibold">外观设置</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            主题切换已集成在顶部导航栏的主题切换按钮中
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <LucideIcons.Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">通知设置</h2>
          </div>
          <p className="text-sm text-muted-foreground">通知功能正在开发中</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <LucideIcons.Lock className="h-5 w-5" />
            <h2 className="text-lg font-semibold">安全设置</h2>
          </div>
          <p className="text-sm text-muted-foreground">密码修改功能正在开发中</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <LucideIcons.Globe className="h-5 w-5" />
            <h2 className="text-lg font-semibold">语言设置</h2>
          </div>
          <p className="text-sm text-muted-foreground">当前语言：简体中文</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg border p-6">
        <div className="flex items-start gap-3">
          <LucideIcons.Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">功能开发中</p>
            <p className="text-sm text-muted-foreground mt-1">
              详细设置功能正在开发中，敬请期待。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
