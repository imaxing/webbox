"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { Trash2, Grid3x3 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useDict } from "@/hooks";
import api from "@/api";
import type { CustomTemplate, BaseTemplate } from "@/api/template";
import type { RouteRule, RouteType } from "@/api/route";

export interface DomainConfigDialogProps {
  domain: {
    _id: string;
    domain: string;
    app_name: string;
    [key: string]: any;
  };
  onSuccess?: () => void;
  onClose?: () => void;
}

interface RouteConfig {
  _id?: string;
  template_id: string;
  route_id?: string;
  pattern: string;
  type: RouteType;
  priority: number;
  enabled: boolean;
}

type TemplateType = "base" | "custom";

export default function DomainConfigDialog({
  domain,
  onSuccess,
  onClose,
}: DomainConfigDialogProps) {
  const dicts = useDict();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templateType, setTemplateType] = useState<TemplateType>("custom");
  const [baseTemplates, setBaseTemplates] = useState<BaseTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [routes, setRoutes] = useState<RouteRule[]>([]);
  const [configs, setConfigs] = useState<RouteConfig[]>([]);

  // 提取域名主机名
  const extractHost = (domainUrl: string): string => {
    if (!domainUrl) return "";
    try {
      const url = new URL(domainUrl);
      return url.hostname;
    } catch (error) {
      return domainUrl
        .replace(/^https?:\/\//, "")
        .split(":")[0]
        .split("/")[0];
    }
  };

  const domainHost = extractHost(domain.domain);

  // 获取当前类型的模板列表
  const currentTemplates =
    templateType === "base" ? baseTemplates : customTemplates;

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 并行加载模板和路由数据
        const [
          baseTemplatesRes,
          customTemplatesRes,
          allRoutesRes,
          domainRoutesRes,
        ] = await Promise.all([
          api.template.base.list({ limit: 1000 }),
          api.template.custom.list({ limit: 1000 }),
          api.route.list({ limit: 1000 }),
          api.route.list({ domain: domainHost, limit: 1000 }),
        ]);

        setBaseTemplates(baseTemplatesRes.data || []);
        setCustomTemplates(customTemplatesRes.data || []);
        setRoutes(allRoutesRes.data || []);

        // 将域名已有的路由转换为配置项
        const domainRoutes = domainRoutesRes.data || [];
        setConfigs(
          domainRoutes.map((route: Record<string, any>) => ({
            _id: route._id,
            template_id:
              typeof route.template === "object"
                ? (route.template as any)._id
                : (route.template_id as string),
            route_id: route._id,
            pattern: route.pattern,
            type: route.type,
            priority: route.priority,
            enabled: route.enabled,
          }))
        );
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [domainHost]);

  // 添加配置行
  const handleAddRow = () => {
    setConfigs([
      ...configs,
      {
        template_id: "",
        pattern: "",
        type: "exact",
        priority: 100,
        enabled: true,
      },
    ]);
  };

  // 模板变更
  const handleTemplateChange = (index: number, templateId: string) => {
    const newConfigs = [...configs];
    newConfigs[index] = {
      ...newConfigs[index],
      template_id: templateId,
      route_id: undefined,
      pattern: "",
      type: "exact",
      priority: 100,
    };
    setConfigs(newConfigs);
  };

  // 路由变更
  const handleRouteChange = (index: number, routeId: string) => {
    const route = routes.find((r) => r._id === routeId);
    if (route) {
      const newConfigs = [...configs];
      newConfigs[index] = {
        ...newConfigs[index],
        route_id: routeId,
        pattern: route.pattern,
        type: route.type,
        priority: route.priority,
      };
      setConfigs(newConfigs);
    }
  };

  // 检查模板是否被禁用 - 已选择的模板不可重复选择
  const isTemplateDisabled = (
    templateId: string,
    currentConfig: RouteConfig
  ) => {
    return configs.some(
      (c) => c !== currentConfig && c.template_id === templateId
    );
  };

  // 检查路由是否被禁用
  const isRouteDisabled = (routeId: string, currentConfig: RouteConfig) => {
    if (!currentConfig.template_id) return false;
    return configs.some(
      (c) =>
        c !== currentConfig &&
        c.template_id === currentConfig.template_id &&
        c.route_id === routeId
    );
  };

  // 删除配置行
  const handleDeleteRow = async (index: number) => {
    const config = configs[index];

    if (config._id) {
      const confirmed = await toast.confirm("确定删除该配置吗？");
      if (!confirmed) return;

      try {
        await api.route.delete(config._id);
        toast.success("删除成功");
        setConfigs(configs.filter((_, i) => i !== index));
      } catch (error) {
        console.error("删除失败:", error);
      }
    } else {
      setConfigs(configs.filter((_, i) => i !== index));
    }
  };

  // 获取完整URL
  const getFullUrl = (config: RouteConfig): string => {
    if (!config.pattern) return "-";

    const baseUrl = domain.domain.replace(/\/$/, "");
    let testPath = config.pattern;

    if (config.type === "wildcard" && testPath.includes("*")) {
      testPath = testPath.replace("*", "test");
    } else if (config.type === "regex") {
      testPath = config.pattern
        .replace(/[\^$.*+?()[\]{}|\\]/g, "")
        .replace(/\\/g, "/");
    }

    const path = testPath.startsWith("/") ? testPath : `/${testPath}`;
    return `${baseUrl}${path}`;
  };

  // 提交保存
  const handleSubmit = async () => {
    // 验证
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      if (!config.template_id) {
        toast.error(`第 ${i + 1} 行：请选择模板`);
        return;
      }
      if (!config.route_id && !config.pattern) {
        toast.error(`第 ${i + 1} 行：请选择路由规则`);
        return;
      }
    }

    // 检查重复
    const combinations = configs.map((c) => `${c.template_id}_${c.route_id}`);
    const duplicates = combinations.filter(
      (item, index) => combinations.indexOf(item) !== index
    );
    if (duplicates.length > 0) {
      toast.error("存在重复的模板和路由组合，请检查配置");
      return;
    }

    try {
      setSubmitting(true);

      const promises = configs.map((config) => {
        const data = {
          pattern: config.pattern,
          type: config.type,
          domain: domainHost,
          template_id: config.template_id,
          priority: config.priority,
          enabled: config.enabled,
        };

        return config._id
          ? api.route.update(config._id, data)
          : api.route.create(data);
      });

      await Promise.all(promises);
      toast.success("保存成功");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 dark:bg-gray-900">
      {/* 上方：域名信息 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Grid3x3 className="text-xl text-blue-500" />
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              域名信息
            </span>
          </div>

          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                域名:
              </span>
              <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                {domainHost}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                应用:
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {domain.app_name}
              </span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  基础模板
                </span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {baseTemplates.length}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  自定义模板
                </span>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {customTemplates.length}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  当前配置
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {configs.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下方：配置表格 */}
      <div className="flex-1 flex flex-col">
        {/* 标题栏 */}
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3x3 className="text-xl text-indigo-500" />
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                路由配置
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                {configs.length} 条
              </span>
            </div>
            <Button size="sm" onClick={handleAddRow}>
              新增配置
            </Button>
          </div>
        </div>

        {/* 配置表格 */}
        <div className="flex-1 overflow-auto p-6">
          {configs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="text-7xl text-gray-300 dark:text-gray-600 mb-4">
                📝
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-base">
                暂无配置
              </div>
              <div className="mt-2 text-gray-400 dark:text-gray-500 text-sm">
                点击上方"新增配置"按钮开始添加
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Table className="w-full text-sm">
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                  <TableRow>
                    <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[35%]">
                      模板
                    </TableHead>
                    <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[30%]">
                      路由规则
                    </TableHead>
                    <TableHead className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[30%]">
                      完整地址
                    </TableHead>
                    <TableHead className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-[5%]">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config, index) => (
                    <TableRow
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                templateType === "base" ? "default" : "outline"
                              }
                              onClick={() => setTemplateType("base")}
                              className="h-9 text-xs px-2"
                            >
                              基础
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                templateType === "custom"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setTemplateType("custom")}
                              className="h-9 text-xs px-2"
                            >
                              自定义
                            </Button>
                          </div>
                          <Select
                            value={config.template_id}
                            onValueChange={(value) =>
                              handleTemplateChange(index, value)
                            }
                          >
                            <SelectTrigger className="flex-1 min-w-[200px]">
                              <SelectValue placeholder="选择模板" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentTemplates.map((tpl) => (
                                <SelectItem
                                  key={tpl._id}
                                  value={tpl._id!}
                                  disabled={isTemplateDisabled(
                                    tpl._id!,
                                    config
                                  )}
                                >
                                  {tpl.display_name || tpl.name}
                                  {templateType === "custom" &&
                                    (tpl as CustomTemplate).status &&
                                    ` - ${
                                      dicts.map.templateStatus[
                                        (tpl as CustomTemplate).status
                                      ]
                                    }`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Select
                          value={config.route_id || ""}
                          onValueChange={(value) =>
                            handleRouteChange(index, value)
                          }
                          disabled={!config.template_id}
                        >
                          <SelectTrigger className="w-full min-w-[200px]">
                            <SelectValue placeholder="选择路由规则" />
                          </SelectTrigger>
                          <SelectContent>
                            {routes.map((route) => (
                              <SelectItem
                                key={route._id}
                                value={route._id!}
                                disabled={isRouteDisabled(route._id!, config)}
                              >
                                {route.pattern} -{" "}
                                {dicts.map.routeType[route.type]} (优先级
                                {route.priority})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div
                          className="text-sm text-blue-600 dark:text-blue-400 font-mono truncate"
                          title={getFullUrl(config)}
                        >
                          {getFullUrl(config)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg border border-blue-100 dark:border-blue-800">
            <svg
              className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                温馨提示
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                配置将自动关联到当前域名。相同的模板和路由组合不能重复选择。
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "保存中..." : "保存所有配置"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
