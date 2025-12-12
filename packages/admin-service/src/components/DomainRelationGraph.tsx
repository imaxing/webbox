'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDomainList } from '@/api/domain';
import { getCustomTemplateList } from '@/api/template';
import { getRouteList } from '@/api/route';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartData {
  domain: string;
  app_name: string;
  templates: number;
  routes: number;
}

export default function DomainRelationGraph() {
  const [data, setData] = useState<ChartData[]>([]);
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

      const chartData: ChartData[] = domains.map((domain: any) => {
        const templatesCount = templates.filter(
          (t: any) => t.domain === domain.domain
        ).length;

        const routesCount = routes.filter(
          (r: any) => r.domain === domain.domain
        ).length;

        return {
          domain: domain.domain,
          app_name: domain.app_name || '',
          templates: templatesCount,
          routes: routesCount,
        };
      });

      setData(chartData);
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.domain}
          </p>
          {data.app_name && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              应用: {data.app_name}
            </p>
          )}
          <p className="text-sm text-green-600 dark:text-green-400">
            📄 模板: {data.templates}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            🛣️ 路由: {data.routes}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#48bb78]"></div>
            <span className="text-gray-700 dark:text-gray-300">模板数量</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#f59e0b]"></div>
            <span className="text-gray-700 dark:text-gray-300">路由数量</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(400, data.length * 80)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
          />
          <XAxis
            type="number"
            stroke="#9ca3af"
            className="dark:stroke-gray-400"
          />
          <YAxis
            dataKey="domain"
            type="category"
            width={200}
            stroke="#9ca3af"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="templates" fill="#48bb78" name="模板数量" radius={[0, 4, 4, 0]} />
          <Bar dataKey="routes" fill="#f59e0b" name="路由数量" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* 数据概览 */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">域名总数</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.reduce((sum, item) => sum + item.templates, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">模板总数</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {data.reduce((sum, item) => sum + item.routes, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">路由总数</p>
        </div>
      </div>
    </div>
  );
}
