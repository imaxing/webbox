'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/collapsible';
import { Badge } from '@/components/badge';
import { ScrollArea } from '@/components/scroll-area';
import * as LucideIcons from 'lucide-react';
import type { MenuItem } from '@/api/menu';

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
    if (item.subItems) {
      return item.subItems.some((sub) => pathname === sub.path);
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
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
      )}
      {items.map((item) => {
        const Icon = getIcon(item.icon);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isOpen = openMenus.includes(item.name);
        const isActive = isMenuActive(item);

        // 如果有路径且没有子菜单，直接渲染链接
        if (item.path && !hasSubItems) {
          return (
            <Link key={item.name} href={item.path}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5', !sidebarOpen && 'h-6 w-6')} />
                {sidebarOpen && <span className="flex-1">{item.name}</span>}
              </div>
            </Link>
          );
        }

        // 有子菜单的情况
        if (hasSubItems) {
          return (
            <Collapsible
              key={item.name}
              open={isOpen}
              onOpenChange={() => toggleMenu(item.name)}
            >
              <CollapsibleTrigger
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5', !sidebarOpen && 'h-6 w-6')} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    <LucideIcons.ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </CollapsibleTrigger>
              {sidebarOpen && (
                <CollapsibleContent className="space-y-1 pl-11 pt-1">
                  {item.subItems?.map((subItem) => (
                    <Link key={subItem.path} href={subItem.path}>
                      <div
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          isSubMenuActive(subItem.path) &&
                            'bg-accent text-accent-foreground font-medium'
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
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground',
              !sidebarOpen && 'justify-center px-2'
            )}
          >
            <Icon className={cn('h-5 w-5', !sidebarOpen && 'h-6 w-6')} />
            {sidebarOpen && <span className="flex-1">{item.name}</span>}
          </div>
        );
      })}
    </div>
  );
}
