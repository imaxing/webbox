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

interface RouteData {
  _id?: string;
  pattern?: string;
  type?: string;
}

interface TemplateData {
  _id?: string;
  name?: string;
}

interface DomainData {
  domain: string;
  app_name: string;
  routes: Array<{
    route: string; // 路由 ID
    template: string; // 模板 ID
    routeData?: RouteData; // 路由详情
    templateData?: TemplateData; // 模板详情
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
const TemplateNode = ({ data }: any) => {
  const handleClick = () => {
    if (data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg px-4 py-2.5 shadow-md min-w-[180px] cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
      onClick={handleClick}
      title={data.url ? `点击打开: ${data.url}` : ""}
    >
      <Handle type="target" position={Position.Left} />
      <div className="text-sm text-green-800 dark:text-green-300 font-medium">
        📄 {data.label}
      </div>
      {data.url && (
        <div className="text-xs text-green-600 dark:text-green-400 mt-1 truncate">
          🔗 {data.url}
        </div>
      )}
    </div>
  );
};

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
  const [data, setData] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 查询所有域名列表
      const domainsRes = await api.domain.list({ limit: 1000 });
      const domains = domainsRes.data || [];

      console.log("[DomainRelationGraph] 查询到的域名列表:", domains);

      // 2. 对每个域名，调用 relations 接口获取关联的路由和模板详情
      const domainRelationsPromises = domains.map(async (domain: any) => {
        try {
          const relationsRes = await api.domain.getRelations(domain._id);
          const { routes = [], templates = [] } = relationsRes || {};

          console.log(
            `[DomainRelationGraph] 域名 ${domain.domain} 的关联数据:`,
            {
              原始响应: relationsRes,
              routes,
              templates,
              domainRoutes: domain.routes,
            }
          );

          // 创建路由和模板的 ID 映射
          const routeMap = new Map(routes.map((r: any) => [String(r._id), r]));
          const templateMap = new Map(
            templates.map((t: any) => [String(t._id), t])
          );

          // 构建包含详情的路由-模板映射
          return {
            domain: domain.domain,
            app_name: domain.app_name || "",
            routes: (domain.routes || []).map((mapping: any) => ({
              route: mapping.route,
              template: mapping.template,
              routeData: routeMap.get(String(mapping.route)),
              templateData: templateMap.get(String(mapping.template)),
            })),
          };
        } catch (error) {
          console.error(
            `[DomainRelationGraph] 查询域名 ${domain.domain} 关联数据失败:`,
            error
          );
          return {
            domain: domain.domain,
            app_name: domain.app_name || "",
            routes: [],
          };
        }
      });

      // 3. 等待所有域名的关联数据查询完成
      const finalData = await Promise.all(domainRelationsPromises);

      console.log("[DomainRelationGraph] 最终拼接的数据:", finalData);

      setData(finalData);
    } catch (error) {
      console.error("[DomainRelationGraph] 加载关系图数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 生成节点和边
  useEffect(() => {
    if (data.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // 布局参数
    const domainX = 50;
    const routeX = 400;
    const templateX = 750;
    const domainGroupSpacing = 200; // 域名组之间的垂直间距
    const nodeSpacing = 80; // 同一域名内节点的垂直间距
    let currentY = 50;

    // 为每个域名创建独立的节点组
    data.forEach((domainData, domainIndex) => {
      const domainNodeId = `domain-${domainIndex}`;
      const routesCount = (domainData.routes || []).length;

      // 1. 创建域名节点
      newNodes.push({
        id: domainNodeId,
        type: "domain",
        position: { x: domainX, y: currentY },
        data: {
          label: domainData.domain,
          appName: domainData.app_name,
        },
      });

      let routeY = currentY;

      // 2. 为该域名的每个路由-模板映射创建独立的节点和边
      (domainData.routes || []).forEach(
        (mapping: any, mappingIndex: number) => {
          const {
            route: routeId,
            template: templateId,
            routeData,
            templateData,
          } = mapping;

          // 2.1 创建该域名专属的路由节点
          const routeNodeId = `domain-${domainIndex}-route-${mappingIndex}`;
          newNodes.push({
            id: routeNodeId,
            type: "route",
            position: { x: routeX, y: routeY },
            data: {
              label: routeData?.pattern || routeId,
            },
          });

          // 2.2 计算完整 URL
          const baseUrl = domainData.domain.replace(/\/$/, "");
          const pattern = routeData?.pattern || "";
          let fullUrl = "";

          if (pattern) {
            let path = pattern;
            // 处理通配符和正则
            if (routeData?.type === "wildcard" && path.includes("*")) {
              path = path.replace("*", "example");
            } else if (routeData?.type === "regex") {
              path = path.replace(/[\^$.*+?()[\]{}|\\]/g, "");
            }

            const finalPath = path.startsWith("/") ? path : `/${path}`;
            fullUrl = `${baseUrl}${finalPath}`;
          }

          // 2.3 创建该域名专属的模板节点
          const templateNodeId = `domain-${domainIndex}-template-${mappingIndex}`;
          newNodes.push({
            id: templateNodeId,
            type: "template",
            position: { x: templateX, y: routeY },
            data: {
              label: templateData?.name || templateId,
              url: fullUrl,
            },
          });

          // 2.4 创建边：域名 -> 路由
          newEdges.push({
            id: `${domainNodeId}-${routeNodeId}`,
            source: domainNodeId,
            target: routeNodeId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#a855f7", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
          });

          // 2.5 创建边：路由 -> 模板
          newEdges.push({
            id: `${routeNodeId}-${templateNodeId}`,
            source: routeNodeId,
            target: templateNodeId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#f97316", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#f97316" },
          });

          routeY += nodeSpacing;
        }
      );

      // 3. 更新下一个域名组的起始Y坐标
      currentY += Math.max(domainGroupSpacing, routesCount * nodeSpacing + 50);
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

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
    </div>
  );
}
