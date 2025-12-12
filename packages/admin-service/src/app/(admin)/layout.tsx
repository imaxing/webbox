"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AntButton } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DynamicMenu } from "@/components";
import { ThemeToggle } from "@/components";
import { PageTransition } from "@/components";
import api from "@/api";
import type { MenuConfig } from "@/api/menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import * as LucideIcons from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);

  // 注意：认证重定向已由 middleware.ts 在服务器端处理
  // AdminLayout 只需要在客户端加载期间显示 loading 状态

  // 加载菜单配置
  useEffect(() => {
    const loadMenus = async () => {
      try {
        console.log("[AdminLayout] 开始从接口加载菜单");
        const config = await api.menu.getMenus();
        console.log("[AdminLayout] 菜单加载成功", config);
        setMenuConfig(config);
      } catch (error) {
        console.error("[AdminLayout] 加载菜单失败:", error);
        toast.error("加载菜单失败");
        // 设置空菜单
        setMenuConfig({ main: [], others: [] });
      } finally {
        console.log("[AdminLayout] 菜单加载完成");
        setMenuLoading(false);
      }
    };

    if (isAuthenticated) {
      console.log("[AdminLayout] 已认证，加载菜单");
      loadMenus();
    } else {
      console.log("[AdminLayout] 未认证，不加载菜单");
      // 如果未认证也设置loading为false
      setMenuLoading(false);
    }
  }, [isAuthenticated]);

  // 在认证加载期间显示加载状态
  // 注意：middleware 已确保只有已登录用户能访问此页面
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LucideIcons.Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 获取用户头像缩写
  const getUserAvatar = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // 角色映射
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "管理员",
      editor: "编辑员",
      viewer: "查看员",
    };
    return roleMap[role] || role;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside
        className={cn(
          "border-r flex flex-col bg-card transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* 头部 */}
        <div className="flex h-16 items-center justify-center px-4 shrink-0">
          <div className="flex items-center gap-2">
            <LucideIcons.Box className="h-6 w-6 text-primary" />
            {sidebarOpen && <h1 className="font-bold text-xl">Webbox</h1>}
          </div>
        </div>

        {/* 菜单区域 */}
        <ScrollArea className="flex-1 px-3 py-4">
          {menuLoading ? (
            <div className="flex items-center justify-center py-8">
              <LucideIcons.Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : menuConfig ? (
            <div className="space-y-6">
              {/* 主菜单 */}
              {menuConfig.main && menuConfig.main.length > 0 && (
                <DynamicMenu
                  items={menuConfig.main}
                  sidebarOpen={sidebarOpen}
                  title="主菜单"
                />
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              {sidebarOpen ? "暂无菜单" : "无"}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="border-b bg-card shrink-0">
          <div className="h-16 px-6 flex items-center justify-between">
            {/* 左侧：侧边栏切换按钮 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
              >
                {sidebarOpen ? (
                  <LucideIcons.PanelLeftClose className="h-5 w-5" />
                ) : (
                  <LucideIcons.PanelLeftOpen className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* 右侧：功能按钮 */}
            <div className="flex items-center gap-2">
              {/* 刷新按钮 */}
              <button
                onClick={() => router.refresh()}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title="刷新页面"
              >
                <LucideIcons.RefreshCw className="h-5 w-5" />
              </button>

              {/* 主题切换 */}
              <ThemeToggle />

              {/* 用户菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {getUserAvatar()}
                    </div>
                    <LucideIcons.ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <LucideIcons.User className="mr-2 h-4 w-4" />
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <LucideIcons.Settings className="mr-2 h-4 w-4" />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LucideIcons.LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <ScrollArea className="flex-grow min-h-0 p-3">
          <PageTransition>{children}</PageTransition>
        </ScrollArea>
      </main>
    </div>
  );
}
