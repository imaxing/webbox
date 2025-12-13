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
import { AntSelect } from "@/components";
import { useTheme } from "next-themes";

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
  <div className="rounded-xl border border-border bg-card px-4 py-3 text-foreground shadow-sm min-w-[220px] dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
    <Handle type="source" position={Position.Right} />
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-blue-400" />
      <div className="font-semibold text-sm">{data.label}</div>
    </div>
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
      className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm min-w-[220px] cursor-pointer hover:border-border/70 transition-colors dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
      onClick={handleClick}
      title={data.url ? `点击打开: ${data.url}` : ""}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <div className="text-sm text-foreground font-medium dark:text-white">{data.label}</div>
      </div>
      {data.url && (
        <div className="text-xs text-muted-foreground mt-1 truncate dark:text-white/60">{data.url}</div>
      )}
    </div>
  );
};

// 自定义路由节点
const RouteNode = ({ data }: any) => (
  <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm min-w-[220px] dark:border-white/10 dark:bg-white/[0.04]">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-orange-400" />
      <div className="text-sm text-foreground font-mono dark:text-white">{data.label}</div>
    </div>
  </div>
);

const nodeTypes = {
  domain: DomainNode,
  template: TemplateNode,
  route: RouteNode,
};

export default function DomainRelationGraph() {
  const { resolvedTheme } = useTheme();
  const is_dark = resolvedTheme === "dark";
  const [data, setData] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

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
          label: domainData.app_name || "未命名应用",
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

  const domainOptions = useMemo(() => {
    return data
      .map((item, index) => ({
        value: item.domain,
        label: item.app_name || "未命名应用",
        count: (item.routes || []).length,
        index,
      }))
      .filter((item) => item.value)
      .sort((a, b) => {
        // 有数据的优先展示：按 routes 数量降序，其次保持原始顺序
        if (b.count !== a.count) return b.count - a.count;
        return a.index - b.index;
      })
      .map(({ value, label }) => ({ value, label }));
  }, [data]);

  const quickDomains = useMemo(() => {
    return domainOptions.slice(0, 2);
  }, [domainOptions]);

  const moreDomains = useMemo(() => {
    return domainOptions.slice(2);
  }, [domainOptions]);

  const filteredNodes = useMemo(() => {
    if (selectedDomain === "all") return nodes;
    const domainIndex = data.findIndex((d) => d.domain === selectedDomain);
    if (domainIndex < 0) return nodes;
    const prefix = `domain-${domainIndex}`;
    return (nodes as any[]).filter((n) => String(n.id).startsWith(prefix));
  }, [nodes, data, selectedDomain]);

  const filteredEdges = useMemo(() => {
    if (selectedDomain === "all") return edges;
    const idSet = new Set((filteredNodes as any[]).map((n) => String(n.id)));
    return (edges as any[]).filter(
      (e) => idSet.has(String(e.source)) && idSet.has(String(e.target))
    );
  }, [edges, filteredNodes, selectedDomain]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] rounded-2xl border border-border bg-card shadow-sm dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0b0f17] dark:to-[#070a0f]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground dark:text-white/60">加载关系图...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 shadow-sm dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0b0f17] dark:to-[#070a0f]">
        <div className="text-center text-muted-foreground dark:text-white/60">暂无域名关系数据</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0b0f17] dark:to-[#070a0f]">
      {/* 标题栏（仅主题风格） */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border dark:border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground dark:text-white">域名关系图</h3>
          <div className="text-xs text-muted-foreground dark:text-white/50">
            域名 {totalStats.domains} · 路由 {totalStats.routes} · 模板{" "}
            {totalStats.templates}
          </div>
        </div>

        {/* 域名筛选（2 个快捷 + 更多下拉） */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-border bg-background/70 backdrop-blur p-1 dark:border-white/10 dark:bg-black/30">
            {quickDomains.map((name) => {
              const active = selectedDomain === name.value;
              return (
                <button
                  key={name.value}
                  type="button"
                  onClick={() => setSelectedDomain(name.value)}
                  className={[
                    "px-4 py-2 text-sm rounded-lg transition-colors",
                    active
                      ? "bg-primary/10 text-foreground dark:bg-white/[0.14] dark:text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  {name.label}
                </button>
              );
            })}

            <div className="w-px h-7 bg-border mx-1 dark:bg-white/10" />

            <div className="min-w-[160px]">
              <AntSelect
                value={selectedDomain}
                onChange={(value) => setSelectedDomain(String(value))}
                options={[
                  { label: "全部域名", value: "all" },
                  ...moreDomains.map((item) => ({
                    label: item.label,
                    value: item.value,
                  })),
                ]}
                placeholder="更多"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* React Flow 画布 */}
      <div className="rounded-b-2xl" style={{ height: "720px" }}>
        <ReactFlow
          nodes={filteredNodes as any}
          edges={filteredEdges as any}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          className={is_dark ? "bg-transparent" : "bg-background"}
          proOptions={{ hideAttribution: false }}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={28}
            size={1}
            color={is_dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
            className={is_dark ? "bg-transparent" : "bg-background"}
          />
          <Controls className="bg-background/70 backdrop-blur border border-border rounded-xl shadow-sm dark:bg-black/40 dark:border-white/10 [&_button]:border-border [&_button]:bg-background [&_button:hover]:bg-muted dark:[&_button]:border-white/10 dark:[&_button]:bg-white/[0.06] dark:[&_button:hover]:bg-white/[0.10]" />
          <MiniMap
            className="bg-background/70 backdrop-blur border border-border rounded-xl shadow-sm dark:bg-black/40 dark:border-white/10"
            nodeColor={(node) => {
              if (node.type === "domain") return "#60a5fa";
              if (node.type === "template") return "#34d399";
              if (node.type === "route") return "#fb923c";
              return "#64748b";
            }}
          />
          <Panel
            position="top-right"
            className="bg-background/70 backdrop-blur border border-border rounded-xl shadow-sm p-3 dark:bg-black/40 dark:border-white/10"
          >
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-muted-foreground dark:text-white/70">域名节点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-muted-foreground dark:text-white/70">模板节点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-muted-foreground dark:text-white/70">路由节点</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
