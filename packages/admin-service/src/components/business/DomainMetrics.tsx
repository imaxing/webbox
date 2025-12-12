"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, FileText, GitBranch } from "lucide-react";
import api from "@/api";
import { OverallStatistics } from "@/api/statistics";

export default function DomainMetrics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverallStatistics>({
    total_domains: 0,
    active_domains: 0,
    total_templates: 0,
    active_templates: 0,
    total_routes: 0,
    enabled_routes: 0,
  });

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const data = await api.statistics.domain();
        setStats(data.overall);
      } catch (error) {
        console.error("加载统计数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStatistics();
  }, []);

  const metrics = [
    {
      title: "总域名数",
      value: stats.total_domains,
      subtitle: `生效: ${stats.active_domains}`,
      icon: Grid3x3,
      color: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: "/domains",
    },
    {
      title: "总模板数",
      value: stats.total_templates,
      subtitle: `激活: ${stats.active_templates}`,
      icon: FileText,
      color: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      link: "/templates",
    },
    {
      title: "总路由数",
      value: stats.total_routes,
      subtitle: `启用: ${stats.enabled_routes}`,
      icon: GitBranch,
      color: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      link: "/routes",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          onClick={() => router.push(metric.link)}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.color}`}
          >
            <metric.icon className={`size-6 ${metric.iconColor}`} />
          </div>

          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {metric.title}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-3xl dark:text-white/90">
              {metric.value}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {metric.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
