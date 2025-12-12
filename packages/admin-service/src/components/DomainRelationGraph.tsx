'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDomainList } from '@/api/domain';
import { getCustomTemplateList } from '@/api/template';
import { getRouteList } from '@/api/route';

interface DomainData {
  domain: string;
  app_name: string;
  templates: Array<{ name: string }>;
  routes: Array<{ pattern: string }>;
}

export default function DomainRelationGraph() {
  const [data, setData] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [domainsRes, templatesRes, routesRes] = await Promise.all([
        getDomainList({ limit: 1000 }),
        getCustomTemplateList({ limit: 10000 }),
        getRouteList({ limit: 10000 }),
      ]);

      const domains = domainsRes.data || [];
      const templates = templatesRes.data || [];
      const routes = routesRes.data || [];

      const relationData: DomainData[] = domains.map((domain: any) => {
        const domainTemplates = templates
          .filter((t: any) => t.domain === domain.domain)
          .map((t: any) => ({ name: t.name || t.display_name }));

        const domainRoutes = routes
          .filter((r: any) => r.domain === domain.domain)
          .map((r: any) => ({ pattern: r.pattern }));

        return {
          domain: domain.domain,
          app_name: domain.app_name || '',
          templates: domainTemplates,
          routes: domainRoutes,
        };
      });

      setData(relationData);
    } catch (error) {
      console.error('加载关系图数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载关系图...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12">
        <div className="text-center text-gray-500 dark:text-gray-400">
          暂无域名关系数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
      {/* 标题 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          域名关系图
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          展示域名与其关联的模板和路由关系
        </p>
      </div>

      {/* 树状关系图 */}
      <div className="space-y-6">
        {data.map((domain, idx) => (
          <div key={idx} className="relative">
            {/* 域名节点 */}
            <div className="flex items-start gap-6">
              {/* 左侧域名卡片 */}
              <div className="flex-shrink-0 w-48">
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white shadow-lg">
                  <div className="font-bold text-base mb-1 truncate">
                    {domain.domain}
                  </div>
                  {domain.app_name && (
                    <div className="text-xs opacity-90 truncate">
                      {domain.app_name}
                    </div>
                  )}
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 transform rotate-45 -translate-y-1/2"></div>
                </div>
              </div>

              {/* 右侧资源列表 */}
              <div className="flex-1 space-y-3 pt-2">
                {/* 模板列表 */}
                {domain.templates.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      📄 模板 ({domain.templates.length})
                    </div>
                    <div className="space-y-2">
                      {domain.templates.map((template, tIdx) => (
                        <div
                          key={tIdx}
                          className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-6 before:h-0.5 before:bg-gradient-to-r before:from-purple-400 before:to-transparent"
                        >
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5 text-sm text-green-800 dark:text-green-300 font-medium truncate shadow-sm hover:shadow-md transition-shadow">
                            {template.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 路由列表 */}
                {domain.routes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      🛣️ 路由 ({domain.routes.length})
                    </div>
                    <div className="space-y-2">
                      {domain.routes.map((route, rIdx) => (
                        <div
                          key={rIdx}
                          className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-6 before:h-0.5 before:bg-gradient-to-r before:from-purple-400 before:to-transparent"
                        >
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-2.5 text-sm text-orange-800 dark:text-orange-300 font-mono truncate shadow-sm hover:shadow-md transition-shadow">
                            {route.pattern}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 无关联资源提示 */}
                {domain.templates.length === 0 && domain.routes.length === 0 && (
                  <div className="text-sm text-gray-400 dark:text-gray-600 italic">
                    暂无关联的模板或路由
                  </div>
                )}
              </div>
            </div>

            {/* 分隔线 */}
            {idx < data.length - 1 && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700"></div>
            )}
          </div>
        ))}
      </div>

      {/* 统计概览 */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {data.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">域名总数</p>
        </div>
        <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.reduce((sum, item) => sum + item.templates.length, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">模板总数</p>
        </div>
        <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {data.reduce((sum, item) => sum + item.routes.length, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">路由总数</p>
        </div>
      </div>
    </div>
  );
}
