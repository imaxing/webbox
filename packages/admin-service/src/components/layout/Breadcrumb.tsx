"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// 路由名称映射配置
const routeNameMap: Record<string, string> = {
  // 域名管理
  domains: "域名管理",

  // 路由管理
  routes: "路由管理",

  // 模板管理
  templates: "模板管理",
  base: "基础模板",
  custom: "自定义模板",

  // 菜单管理
  menus: "菜单管理",

  // 用户管理
  users: "用户管理",
  profile: "个人资料",
  settings: "设置",

  // 其他
  dashboard: "控制台",
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // 过滤掉空字符串并移除 (admin) 路由组
    const segments = pathname
      .split("/")
      .filter((segment) => segment && !segment.startsWith("("));

    const items: BreadcrumbItem[] = [
      { label: "首页", href: "/" },
    ];

    // 构建面包屑路径
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeNameMap[segment] || segment;

      // 最后一个不需要链接
      if (index === segments.length - 1) {
        items.push({ label });
      } else {
        items.push({ label, href: currentPath });
      }
    });

    return items;
  }, [pathname]);

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors",
                index === 0 && "text-muted-foreground/70"
              )}
            >
              {index === 0 && <Home className="h-4 w-4" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
