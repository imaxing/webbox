"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import api from "@/api";
import { useDict } from "@/hooks";

interface RouteData {
  id: string;
  pattern: string;
}

interface TemplateData {
  id: string;
  name: string;
}

interface DomainData {
  domain: string;
  app_name: string;
  routes: Array<{
    route: string; // 路由 ID
    template: string; // 模板 ID
  }>;
}

// 自定义域名节点
const DomainNode = ({ data }: any) => (
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white shadow-lg min-w-[200px]">
    <Handle type="source" position={Position.Right} />
    <div className="font-bold text-base mb-1">{data.label}</div>
    {data.appName && <div className="text-xs opacity-90">{data.appName}</div>}
  </div>
);

// 自定义模板节点
const TemplateNode = ({ data }: any) => (
  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg px-4 py-2.5 shadow-md min-w-[180px]">
    <Handle type="target" position={Position.Left} />
    <div className="text-sm text-green-800 dark:text-green-300 font-medium">
      📄 {data.label}
    </div>
  </div>
);

// 自定义路由节点
const RouteNode = ({ data }: any) => (
  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 dark:border-orange-600 rounded-lg px-4 py-2.5 shadow-md min-w-[180px]">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div className="text-sm text-orange-800 dark:text-orange-300 font-mono">
      🛣️ {data.label}
    </div>
  </div>
);

const nodeTypes = {
  domain: DomainNode,
  template: TemplateNode,
  route: RouteNode,
};

export default function DomainRelationGraph() {
  const dicts = useDict();
  const [data, setData] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 只加载域名数据
      const domainsRes = await api.domain.list({ limit: 1000 });
      const domains = domainsRes.data || [];

      // 简化：只展示域名节点
      setData(
        domains.map((d: any) => ({
          domain: d.domain,
          app_name: d.app_name || "",
          routes: [],
        }))
      );
    } catch (error) {
      console.error("[DomainRelationGraph] 加载关系图数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 生成域名节点（简化版）
  useEffect(() => {
    if (data.length === 0) {
      setNodes([]);
      return;
    }

    const newNodes: Node[] = data.map((domainData, index) => ({
      id: `domain-${index}`,
      type: "domain",
      position: {
        x: 50 + (index % 3) * 300,
        y: 50 + Math.floor(index / 3) * 150,
      },
      data: {
        label: domainData.domain,
        appName: domainData.app_name,
      },
    }));

    setNodes(newNodes);
  }, [data, setNodes]);

  const totalStats = useMemo(() => {
    // 统计实际使用的路由和模板数量
    const usedRoutes = new Set<string>();
    const usedTemplates = new Set<string>();

    data.forEach((item) => {
      item.routes.forEach((mapping) => {
        usedRoutes.add(mapping.route);
        usedTemplates.add(mapping.template);
      });
    });

    return {
      domains: data.length,
      templates: usedTemplates.size,
      routes: usedRoutes.size,
    };
  }, [data]);

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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          域名关系图
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          可拖拽、缩放的交互式流程图
        </p>
      </div>

      {/* React Flow 画布 */}
      <div
        className="border border-gray-200 dark:border-gray-700 rounded-lg"
        style={{ height: "800px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          className="bg-gray-50 dark:bg-gray-950"
          proOptions={{ hideAttribution: false }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            className="bg-gray-50 dark:bg-gray-950"
          />
          <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" />
          <MiniMap
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
            nodeColor={(node) => {
              if (node.type === "domain") return "#a855f7";
              if (node.type === "template") return "#22c55e";
              if (node.type === "route") return "#f97316";
              return "#94a3b8";
            }}
          />
          <Panel
            position="top-right"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3"
          >
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  域名节点
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  模板节点
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  路由节点
                </span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* 统计概览 */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3">
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {totalStats.domains}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            域名总数
          </p>
        </div>
        <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalStats.templates}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            模板总数
          </p>
        </div>
        <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {totalStats.routes}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            路由总数
          </p>
        </div>
      </div>
    </div>
  );
}
