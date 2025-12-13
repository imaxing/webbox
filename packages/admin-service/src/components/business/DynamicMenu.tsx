"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components";
import * as LucideIcons from "lucide-react";
import type { MenuItem } from "@/api/menu";

interface DynamicMenuProps {
  items: MenuItem[];
  sidebarOpen: boolean;
  title?: string;
}

// 动态获取图标组件
const getIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  return Icon;
};

export function DynamicMenu({ items, sidebarOpen, title }: DynamicMenuProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // 切换子菜单展开状态
  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  // 判断菜单是否激活
  const isMenuActive = (item: MenuItem) => {
    if (item.path) {
      return pathname === item.path;
    }
    if (item.children) {
      return item.children.some((sub) => pathname === sub.path);
    }
    return false;
  };

  // 判断子菜单是否激活
  const isSubMenuActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="space-y-1">
      {title && sidebarOpen && (
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = getIcon(item.icon || "Circle");
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.name);
        const isActive = isMenuActive(item);

        // 如果有路径且没有子菜单，直接渲染链接
        if (item.path && !hasChildren) {
          return (
            <Link key={item.name} href={item.path}>
              <div
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 mb-1 text-sm font-medium transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "text-muted-foreground transition-colors",
                    sidebarOpen ? "h-4 w-4" : "h-5 w-5",
                    (isActive || undefined) && "text-foreground",
                    "group-hover:text-foreground"
                  )}
                />
                {sidebarOpen && <span className="flex-1">{item.name}</span>}
              </div>
            </Link>
          );
        }

        // 有子菜单的情况
        if (hasChildren) {
          return (
            <Collapsible
              key={item.name}
              open={isOpen}
              onOpenChange={() => toggleMenu(item.name)}
            >
              <CollapsibleTrigger
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-foreground",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "text-muted-foreground transition-colors",
                    sidebarOpen ? "h-4 w-4" : "h-5 w-5",
                    (isActive || undefined) && "text-foreground",
                    "group-hover:text-foreground"
                  )}
                />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    <LucideIcons.ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out",
                        isOpen && "rotate-180"
                      )}
                    />
                  </>
                )}
              </CollapsibleTrigger>
              {sidebarOpen && (
                <CollapsibleContent className="space-y-1 pl-9 pt-1">
                  {item.children?.map((subItem) => (
                    <Link key={subItem.path} href={subItem.path!}>
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1.5 mb-1 text-sm transition-colors",
                          "hover:bg-muted hover:text-foreground",
                          isSubMenuActive(subItem.path || "") &&
                            "bg-muted text-foreground font-medium"
                        )}
                      >
                        <span className="flex-1">{subItem.name}</span>
                        {subItem.new && (
                          <Badge
                            variant="default"
                            className="h-5 px-1.5 text-xs bg-green-500"
                          >
                            NEW
                          </Badge>
                        )}
                        {subItem.pro && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-xs"
                          >
                            PRO
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          );
        }

        // 没有路径也没有子菜单的情况（标题项）
        return (
          <div
            key={item.name}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground",
              !sidebarOpen && "justify-center px-2"
            )}
          >
            <Icon className={cn(sidebarOpen ? "h-4 w-4" : "h-5 w-5")} />
            {sidebarOpen && <span className="flex-1">{item.name}</span>}
          </div>
        );
      })}
    </div>
  );
}
