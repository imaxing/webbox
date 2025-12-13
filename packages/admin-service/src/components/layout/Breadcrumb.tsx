"use client";

import React, { useMemo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/api";
import type { MenuItem } from "@/api/menu";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// 从菜单项递归构建路由名称映射
function buildRouteNameMap(
  items: MenuItem[],
  map: Record<string, string> = {}
): Record<string, string> {
  items.forEach((item) => {
    if (item.path) {
      // 提取路径的最后一段作为 key
      const segments = item.path.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      if (lastSegment) {
        map[lastSegment] = item.name;
      }
    }
    // 递归处理子菜单
    if (item.children && item.children.length > 0) {
      item.children.forEach((subItem) => {
        if (subItem.path) {
          const segments = subItem.path.split("/").filter(Boolean);
          // 为子路径的每一段建立映射
          segments.forEach((segment, index) => {
            // 第一段路径通常是父级分类（如 templates）
            if (index === 0 && !map[segment]) {
              map[segment] = item.name;
            }
            // 最后一段是具体的子项
            if (index === segments.length - 1) {
              map[segment] = subItem.name;
            }
          });
        }
      });
    }
  });
  return map;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const [routeNameMap, setRouteNameMap] = useState<Record<string, string>>({});

  // 从菜单接口加载路由名称映射
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const menus = await api.menu.getMenus();
        const map = buildRouteNameMap(menus);
        setRouteNameMap(map);
      } catch (error) {
        console.error("[Breadcrumb] 加载菜单失败:", error);
        // 设置默认映射
        setRouteNameMap({
          domains: "域名管理",
          routes: "路由管理",
          templates: "模板管理",
          base: "基础模板",
          custom: "自定义模板",
          users: "用户管理",
          menus: "菜单管理",
        });
      }
    };

    loadMenus();
  }, []);

  const breadcrumbs = useMemo(() => {
    // 过滤掉空字符串并移除 (admin) 路由组
    const segments = pathname
      .split("/")
      .filter((segment) => segment && !segment.startsWith("("));

    const items: BreadcrumbItem[] = [{ label: "首页", href: "/" }];

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
  }, [pathname, routeNameMap]);

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
