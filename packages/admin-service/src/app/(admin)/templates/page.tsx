"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, AntButton } from "@/components";
import api from "@/api";
import type { BaseTemplate, CustomTemplate } from "@/api/template";
import { useDict } from "@/hooks";
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Eye,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplateOverviewPage() {
  const router = useRouter();
  const dicts = useDict();
  const [loading, setLoading] = useState(true);
  const [baseTemplates, setBaseTemplates] = useState<BaseTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [baseRes, customRes] = await Promise.all([
          api.template.base.list({ limit: 100 }),
          api.template.custom.list({ limit: 100 }),
        ]);
        setBaseTemplates(baseRes.data || []);
        setCustomTemplates(customRes.data || []);
      } catch (error) {
        console.error("加载模板数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 统计数据
  const stats = useMemo(() => {
    // 基础模板按分类统计
    const baseByCategoryCount = baseTemplates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 自定义模板按状态统计
    const customByStatus = customTemplates.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      baseTotal: baseTemplates.length,
      customTotal: customTemplates.length,
      baseByCategoryCount,
      customByStatus,
      draftCount: customByStatus.draft || 0,
      activeCount: customByStatus.active || 0,
      archivedCount: customByStatus.archived || 0,
    };
  }, [baseTemplates, customTemplates]);

  // 最近更新的模板
  const recentTemplates = useMemo(() => {
    const allTemplates = [
      ...baseTemplates.map((t) => ({ ...t, type: "base" as const })),
      ...customTemplates.map((t) => ({ ...t, type: "custom" as const })),
    ];

    return allTemplates
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [baseTemplates, customTemplates]);

  // 按分类分组基础模板
  const baseTemplatesByCategory = useMemo(() => {
    return baseTemplates.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = [];
      }
      acc[t.category].push(t);
      return acc;
    }, {} as Record<string, BaseTemplate[]>);
  }, [baseTemplates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 基础模板总数 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">基础模板</p>
              <p className="text-3xl font-bold mt-2">{stats.baseTotal}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">
              {Object.keys(stats.baseByCategoryCount).length} 个分类
            </span>
          </div>
        </Card>

        {/* 自定义模板总数 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">自定义模板</p>
              <p className="text-3xl font-bold mt-2">{stats.customTotal}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Copy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">
              {stats.activeCount} 个已激活
            </span>
          </div>
        </Card>

        {/* 草稿模板 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">草稿模板</p>
              <p className="text-3xl font-bold mt-2">{stats.draftCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Edit className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-muted-foreground">待完善</span>
          </div>
        </Card>

        {/* 归档模板 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">归档模板</p>
              <p className="text-3xl font-bold mt-2">{stats.archivedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-muted-foreground">已停用</span>
          </div>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <AntButton
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push("/templates/base")}
            className="h-auto py-3"
          >
            <div className="text-left">
              <div className="font-medium">创建基础模板</div>
              <div className="text-xs opacity-80">新增可复用模板</div>
            </div>
          </AntButton>

          <AntButton
            type="primary"
            icon={<Copy className="h-4 w-4" />}
            onClick={() => router.push("/templates/custom")}
            className="h-auto py-3"
          >
            <div className="text-left">
              <div className="font-medium">创建自定义模板</div>
              <div className="text-xs opacity-80">基于基础模板定制</div>
            </div>
          </AntButton>

          <AntButton
            icon={<FileText className="h-4 w-4" />}
            onClick={() => router.push("/templates/base")}
            className="h-auto py-3"
          >
            <div className="text-left">
              <div className="font-medium">管理基础模板</div>
              <div className="text-xs opacity-80">查看所有基础模板</div>
            </div>
          </AntButton>

          <AntButton
            icon={<Edit className="h-4 w-4" />}
            onClick={() => router.push("/templates/custom")}
            className="h-auto py-3"
          >
            <div className="text-left">
              <div className="font-medium">管理自定义模板</div>
              <div className="text-xs opacity-80">查看所有自定义模板</div>
            </div>
          </AntButton>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近更新 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">最近更新</h2>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {recentTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                暂无模板
              </p>
            ) : (
              recentTemplates.map((template) => (
                <div
                  key={`${template.type}-${template._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(`/templates/${template.type}`)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {template.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          template.type === "base"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        )}
                      >
                        {template.type === "base" ? "基础" : "自定义"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(
                        template.updatedAt || template.createdAt || ""
                      ).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 基础模板分类 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">基础模板分类</h2>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {Object.entries(baseTemplatesByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                暂无基础模板
              </p>
            ) : (
              Object.entries(baseTemplatesByCategory).map(
                ([category, templates]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push("/templates/base")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {dicts.map.templateCategory[category] || category}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {templates.length} 个模板
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
