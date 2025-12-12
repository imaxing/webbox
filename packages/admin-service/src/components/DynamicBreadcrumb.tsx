'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/breadcrumb';
import * as LucideIcons from 'lucide-react';

// 路径名称映射
const pathNameMap: Record<string, string> = {
  '': '首页',
  'users': '用户管理',
  'domains': '域名管理',
  'routes': '路由管理',
  'templates': '模板管理',
  'demo': '组件示例',
  'profile': '个人资料',
  'settings': '设置',
};

// 路径图标映射
const pathIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  '': LucideIcons.Home,
  'users': LucideIcons.Users,
  'domains': LucideIcons.Globe,
  'routes': LucideIcons.Route,
  'templates': LucideIcons.FileText,
  'demo': LucideIcons.Component,
  'profile': LucideIcons.User,
  'settings': LucideIcons.Settings,
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // 解析路径
  const paths = pathname.split('/').filter(Boolean);

  // 如果只是根路径，不显示面包屑
  if (paths.length === 0) {
    return null;
  }

  // 生成面包屑项
  const breadcrumbItems = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const isLast = index === paths.length - 1;
    const name = pathNameMap[path] || path;
    const Icon = pathIconMap[path] || LucideIcons.Folder;

    return {
      href,
      name,
      isLast,
      Icon,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* 首页 */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1.5">
              <LucideIcons.Home className="h-3.5 w-3.5" />
              <span>首页</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="flex items-center gap-1.5">
                  <item.Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="flex items-center gap-1.5">
                    <item.Icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
