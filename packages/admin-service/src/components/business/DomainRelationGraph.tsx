'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getDomainList } from '@/api/domain';
import { getCustomTemplateList } from '@/api/template';
import { getRouteList } from '@/api/route';

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
    route: string;    // 路由 ID
    template: string; // 模板 ID
  }>;
}

// 自定义域名节点
const DomainNode = ({ data }: any) => (
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white shadow-lg min-w-[200px]">
    <Handle type="source" position={Position.Right} />
    <div className="font-bold text-base mb-1">{data.label}</div>
    {data.appName && (
      <div className="text-xs opacity-90">{data.appName}</div>
    )}
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
  const [data, setData] = useState<DomainData[]>([]);
  const [routes, setRoutes] = useState<Map<string, RouteData>>(new Map());
  const [templates, setTemplates] = useState<Map<string, TemplateData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [domainsRes, templatesRes, routesRes] = await Promise.all([
        getDomainList({ limit: 1000 }),
        getCustomTemplateList({ limit: 10000 }),
        getRouteList({ limit: 10000 }),
      ]);

      console.log('[DomainRelationGraph] API响应:', { domainsRes, templatesRes, routesRes });

      const domains = domainsRes.data || [];
      const templatesData = templatesRes.data || [];
      const routesData = routesRes.data || [];

      // 构建路由 Map (id -> RouteData)
      const routeMap = new Map<string, RouteData>();
      routesData.forEach((r: any) => {
        const id = r._id || r.uuid;
        if (id) {
          routeMap.set(id, {
            id,
            pattern: r.pattern || '未命名路由'
          });
        }
      });

      // 构建模板 Map (id -> TemplateData)
      const templateMap = new Map<string, TemplateData>();
      templatesData.forEach((t: any) => {
        const id = t._id || t.uuid;
        if (id) {
          templateMap.set(id, {
            id,
            name: t.name || t.display_name || '未命名模板'
          });
        }
      });

      // 构建域名关系数据（从 domain.routes 读取）
      const relationData: DomainData[] = domains.map((domain: any) => {
        return {
          domain: domain.domain,
          app_name: domain.app_name || '',
          routes: domain.routes || [], // 从 domain.routes 读取路由-模板映射
        };
      });

      console.log('[DomainRelationGraph] 路由Map:', routeMap);
      console.log('[DomainRelationGraph] 模板Map:', templateMap);
      console.log('[DomainRelationGraph] 最终关系数据:', relationData);

      setRoutes(routeMap);
      setTemplates(templateMap);
      setData(relationData);
    } catch (error) {
      console.error('[DomainRelationGraph] 加载关系图数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 生成节点和边
  useEffect(() => {
    console.log('[DomainRelationGraph] useEffect 触发，data.length:', data.length, 'routes.size:', routes.size, 'templates.size:', templates.size);

    if (data.length === 0) {
      console.log('[DomainRelationGraph] 数据为空，清空节点和边');
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let nodeId = 0;

    const verticalSpacing = 300;
    const horizontalSpacing = 400;
    const resourceVerticalSpacing = 120;

    // 全局模板节点映射（template_id -> node_id）
    const globalTemplateNodeMap = new Map<string, string>();
    let globalTemplateYOffset = 0;

    data.forEach((domainData, domainIndex) => {
      const domainId = `domain-${nodeId++}`;
      const baseY = domainIndex * verticalSpacing;

      // 域名节点（左列）
      newNodes.push({
        id: domainId,
        type: 'domain',
        position: { x: 0, y: baseY },
        data: {
          label: domainData.domain,
          appName: domainData.app_name,
        },
      });

      const routeNodeMap = new Map<string, string>(); // route_id -> routeNodeId
      let routeOffset = 0;

      // 遍历域名的路由-模板映射
      domainData.routes.forEach((mapping) => {
        const routeData = routes.get(mapping.route);
        const templateData = templates.get(mapping.template);

        if (!routeData) {
          console.warn(`[DomainRelationGraph] 未找到路由: ${mapping.route}`);
          return;
        }

        if (!templateData) {
          console.warn(`[DomainRelationGraph] 未找到模板: ${mapping.template}`);
          return;
        }

        // 创建路由节点（中列）
        const routeNodeId = `route-${nodeId++}`;
        routeNodeMap.set(mapping.route, routeNodeId);

        newNodes.push({
          id: routeNodeId,
          type: 'route',
          position: {
            x: horizontalSpacing,
            y: baseY + routeOffset - (domainData.routes.length * resourceVerticalSpacing / 4),
          },
          data: { label: routeData.pattern },
        });

        // 域名 → 路由 连线
        newEdges.push({
          id: `${domainId}-${routeNodeId}`,
          source: domainId,
          target: routeNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#f97316', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f97316',
            width: 20,
            height: 20,
          },
        });

        // 处理模板节点
        let templateNodeId = globalTemplateNodeMap.get(mapping.template);

        if (!templateNodeId) {
          // 首次创建该模板节点（右列）
          templateNodeId = `template-${nodeId++}`;
          globalTemplateNodeMap.set(mapping.template, templateNodeId);

          newNodes.push({
            id: templateNodeId,
            type: 'template',
            position: {
              x: horizontalSpacing * 2,
              y: globalTemplateYOffset,
            },
            data: { label: templateData.name },
          });

          globalTemplateYOffset += resourceVerticalSpacing;
        }

        // 路由 → 模板 连线
        newEdges.push({
          id: `${routeNodeId}-${templateNodeId}`,
          source: routeNodeId,
          target: templateNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#22c55e', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#22c55e',
            width: 20,
            height: 20,
          },
        });

        routeOffset += resourceVerticalSpacing;
      });
    });

    console.log('[DomainRelationGraph] 生成的节点和边:', {
      nodeCount: newNodes.length,
      edgeCount: newEdges.length,
      templateNodeCount: globalTemplateNodeMap.size,
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, routes, templates, setNodes, setEdges]);

  const totalStats = useMemo(() => {
    // 统计实际使用的路由和模板数量
    const usedRoutes = new Set<string>();
    const usedTemplates = new Set<string>();

    data.forEach(item => {
      item.routes.forEach(mapping => {
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
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg" style={{ height: '800px' }}>
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
              if (node.type === 'domain') return '#a855f7';
              if (node.type === 'template') return '#22c55e';
              if (node.type === 'route') return '#f97316';
              return '#94a3b8';
            }}
          />
          <Panel position="top-right" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className="text-gray-700 dark:text-gray-300">域名节点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">模板节点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-700 dark:text-gray-300">路由节点</span>
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">域名总数</p>
        </div>
        <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalStats.templates}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">模板总数</p>
        </div>
        <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {totalStats.routes}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">路由总数</p>
        </div>
      </div>
    </div>
  );
}
