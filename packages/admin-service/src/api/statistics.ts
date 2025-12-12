import { getDomainList } from './domain'
import { getRouteList } from './route'
import { getCustomTemplateList } from './template'

// 域名统计数据
export interface DomainStatistics {
  _id: string
  domain: string
  app_name: string
  project_group?: string
  status: string
  statistics: {
    total_templates: number
    active_templates: number
    total_routes: number
    enabled_routes: number
  }
}

// 项目组统计数据
export interface ProjectGroupStatistics {
  project_group: string
  domain_count: number
  template_count: number
  route_count: number
}

// 总体统计数据
export interface OverallStatistics {
  total_domains: number
  active_domains: number
  total_templates: number
  active_templates: number
  total_routes: number
  enabled_routes: number
}

// 统计响应数据
export interface StatisticsResponse {
  overall: OverallStatistics
  domains: DomainStatistics[]
  by_project: ProjectGroupStatistics[]
}

/**
 * 获取域名统计数据（前端合并）
 */
export const getDomainStatistics = async (): Promise<StatisticsResponse> => {
  // 并行获取所有数据
  const [domainsRes, routesRes, templatesRes] = await Promise.all([
    getDomainList({ limit: 1000 }), // 获取所有域名
    getRouteList({ limit: 10000 }), // 获取所有路由
    getCustomTemplateList({ limit: 10000 }), // 获取所有模板
  ])

  const domains = domainsRes.data || []
  const routes = routesRes.data || []
  const templates = templatesRes.data || []

  // 为每个域名计算统计数据
  const domainStats: DomainStatistics[] = domains.map((domain: any) => {
    const domainTemplates = templates.filter((t: any) => t.domain === domain.domain)
    const domainRoutes = routes.filter((r: any) => r.domain === domain.domain)

    return {
      _id: domain._id,
      domain: domain.domain,
      app_name: domain.app_name,
      project_group: domain.project_group,
      status: domain.status,
      statistics: {
        total_templates: domainTemplates.length,
        active_templates: domainTemplates.filter((t: any) => t.status === 'active').length,
        total_routes: domainRoutes.length,
        enabled_routes: domainRoutes.filter((r: any) => r.enabled).length,
      },
    }
  })

  // 计算总体统计
  const overall: OverallStatistics = {
    total_domains: domains.length,
    active_domains: domains.filter((d: any) => d.status === 'active').length,
    total_templates: templates.length, // 所有模板的总数
    active_templates: templates.filter((t: any) => t.status === 'active').length,
    total_routes: routes.length, // 所有路由的总数
    enabled_routes: routes.filter((r: any) => r.enabled).length,
  }

  // 按项目组分组统计
  const projectGroups: { [key: string]: ProjectGroupStatistics } = {}
  domainStats.forEach((d) => {
    const group = d.project_group || 'default'
    if (!projectGroups[group]) {
      projectGroups[group] = {
        project_group: group,
        domain_count: 0,
        template_count: 0,
        route_count: 0,
      }
    }
    projectGroups[group].domain_count++
    projectGroups[group].template_count += d.statistics.total_templates
    projectGroups[group].route_count += d.statistics.total_routes
  })

  return {
    overall,
    domains: domainStats,
    by_project: Object.values(projectGroups),
  }
}

// 默认导出对象形式
const statistics = {
  domain: getDomainStatistics,
};

export default statistics;
