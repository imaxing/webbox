import { RouteRule, CustomTemplate, Domain, SimpleCache } from '@webbox/shared';
import axios from 'axios';

/**
 * 路由模式匹配器
 */
class RoutePatternMatcher {
  /**
   * 将通配符模式转换为正则表达式
   */
  static wildcardToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * 匹配路径和模式
   */
  static match(path: string, pattern: string, type: 'exact' | 'wildcard' | 'regex'): boolean {
    if (type === 'exact') return path === pattern;
    if (type === 'wildcard') return this.wildcardToRegex(pattern).test(path);
    if (type === 'regex') {
      try {
        return new RegExp(pattern).test(path);
      } catch (e: any) {
        console.error('Invalid regex:', pattern, e.message);
        return false;
      }
    }
    return false;
  }
}

/**
 * 路由解析器
 */
export class RouteResolverService {
  /**
   * 调用三方接口查询变量
   * @param apiUrl 三方接口地址
   * @param host 域名
   * @param path 路径
   */
  private async fetchApiVariables(apiUrl: string, host: string, path: string): Promise<Record<string, any>> {
    try {
      console.log(`🌐 Fetching API variables: ${apiUrl}?host=${host}&path=${path}`);

      const response = await axios.get(apiUrl, {
        params: { host, path },
        timeout: 5000,
        headers: {
          'User-Agent': 'Webbox-Render-Service/1.0'
        }
      });

      if (response.data && typeof response.data === 'object') {
        console.log(`✓ API variables fetched successfully`);
        return response.data;
      }

      return {};
    } catch (error: any) {
      console.error(`Failed to fetch API variables: ${error.message}`);
      return {};
    }
  }

  /**
   * 解析路由并返回模板和变量
   */
  async resolve(host: string, path: string) {
    const cacheKey = `route:${host}:${path}`;
    const cached = SimpleCache.get(cacheKey);

    if (cached) {
      console.log(`✓ Cache hit: ${cacheKey}`);
      return cached;
    }

    try {
      // 1. 查询路由规则
      const rules = await RouteRule.find({
        domain: { $in: [host, 'default'] },
        enabled: true
      }).sort({ priority: -1, createdAt: -1 }).lean();

      if (!rules?.length) return null;

      // 2. 匹配路由（具体域名优先）
      const sortedRules = [
        ...rules.filter(r => r.domain === host),
        ...rules.filter(r => r.domain === 'default')
      ];

      const matchedRule = sortedRules.find(r =>
        RoutePatternMatcher.match(path, r.pattern, r.type)
      );

      if (!matchedRule) return null;

      console.log(`✅ Matched: ${matchedRule.pattern} (${matchedRule.type})`);

      // 3. 加载模板和域名配置
      const [template, domainConfig] = await Promise.all([
        CustomTemplate.findById(matchedRule.template_id).lean(),
        Domain.findOne({ domain: host }).lean()
      ]);

      if (!template) {
        console.error(`Template not found: ${matchedRule.template_id}`);
        return null;
      }

      // 4. 查询三方接口变量（使用环境变量 PROTO_API_URL）
      let apiVars: Record<string, any> = {};

      if (process.env.PROTO_API_URL) {
        apiVars = await this.fetchApiVariables(process.env.PROTO_API_URL, host, path);
      }

      // 5. 处理数据库模板变量
      let templateVars: Record<string, any> = {};
      const vars = template.variables;

      if (vars instanceof Map) {
        templateVars = Object.fromEntries(vars);
      } else if (Array.isArray(vars)) {
        templateVars = Object.fromEntries(vars);
      } else if (typeof vars === 'object' && vars !== null) {
        templateVars = vars;
      }

      // 6. 合并变量（优先级：三方 API > 数据库变量 > 域名基础变量）
      const result = {
        template: template.content,
        variables: {
          // 域名基础变量（最低优先级）
          app_name: domainConfig?.app_name || '',
          email: domainConfig?.email || '',
          domain: host,
          path: path,
          // 数据库模板变量（中等优先级）
          ...templateVars,
          // 三方 API 变量（最高优先级）
          ...apiVars
        },
        templateId: template._id,
        templateName: template.name,
        ruleId: matchedRule._id
      };

      // 7. 缓存结果（300秒 = 5分钟）
      SimpleCache.set(cacheKey, result, 300);

      return result;
    } catch (error: any) {
      console.error('Route resolution error:', error);
      throw error;
    }
  }

  /**
   * 渲染模板（支持变量替换）
   */
  renderTemplate(content: string, variables: Record<string, any>): string {
    if (!content) return '';

    let html = content;
    const vars = variables instanceof Map ? Object.fromEntries(variables) : variables || {};

    // 替换自定义变量 {variable_name}
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\s*${key}\\s*\\}`, 'g');
      html = html.replace(regex, String(value || ''));
    });

    // 内置变量
    const now = new Date();
    return html
      .replace(/\{\s*timestamp\s*\}/g, now.toISOString())
      .replace(/\{\s*year\s*\}/g, now.getFullYear().toString());
  }

  /**
   * 清除缓存
   */
  clearCache(domain?: string): number {
    const pattern = domain ? `route:${domain}:*` : 'route:*';
    const count = SimpleCache.clear(pattern);
    console.log(`✓ Cache cleared: ${count} items`);
    return count;
  }
}

export const routeResolver = new RouteResolverService();
