/**
 * Render Service Demo 页面HTML模板
 * 展示渲染服务的工作原理和配置说明
 */

interface RenderDemoParams {
  host: string;
  path: string;
  dbConnected: boolean;
  nodeEnv: string;
  devHost: string;
  protoApiUrl: string;
}

export function generateRenderDemoHtml(params: RenderDemoParams): string {
  const { host, path, dbConnected, nodeEnv, devHost, protoApiUrl } = params;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Render Service Demo</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 900px;
          margin: 40px auto;
          padding: 0 20px;
          background: #f5f5f5;
        }
        .card {
          background: white;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-top: 0; }
        h2 { color: #666; font-size: 1.2em; margin-top: 0; border-bottom: 2px solid #4CAF50; padding-bottom: 8px; }
        .info-row { margin: 12px 0; }
        .label { font-weight: 600; color: #555; min-width: 120px; display: inline-block; }
        .value { color: #333; }
        .status { padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; }
        .status.connected { background: #4CAF50; color: white; }
        .status.disconnected { background: #f44336; color: white; }
        pre { background: #f8f8f8; padding: 16px; border-radius: 4px; overflow-x: auto; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🎨 Render Service Demo</h1>
        <div class="info-row">
          <span class="label">服务状态:</span>
          <span class="status ${dbConnected ? 'connected' : 'disconnected'}">
            ${dbConnected ? '✓ 运行中' : '✗ 未连接'}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Host:</span>
          <span class="value">${host}</span>
        </div>
        <div class="info-row">
          <span class="label">Path:</span>
          <span class="value">${path}</span>
        </div>
        <div class="info-row">
          <span class="label">时间:</span>
          <span class="value">${new Date().toLocaleString('zh-CN')}</span>
        </div>
        <div class="info-row">
          <span class="label">当前环境:</span>
          <span class="value">${nodeEnv}</span>
        </div>
        <div class="info-row">
          <span class="label">DEV_HOST:</span>
          <span class="value">${devHost}</span>
        </div>
        <div class="info-row">
          <span class="label">API地址:</span>
          <span class="value" style="font-size: 0.85em;">${protoApiUrl}</span>
        </div>
      </div>

      <div class="card">
        <h2>🔍 工作原理</h2>
        <p>渲染服务使用<strong>通配路由</strong>，任何访问的路径都会经过以下处理流程：</p>
        <ol>
          <li><strong>提取 host 和 path</strong>
            <ul style="margin: 8px 0; color: #666; font-size: 0.9em;">
              <li>开发环境: 使用 <code>DEV_HOST</code> 环境变量 (${devHost})</li>
              <li>生产环境: 从 <code>x-forwarded-host</code> 请求头提取</li>
            </ul>
          </li>
          <li><strong>查询路由规则</strong> - 从 RouteRule 表查询匹配规则</li>
          <li><strong>匹配路由模式</strong> - 支持精确(exact) / 通配符(wildcard) / 正则(regex)</li>
          <li><strong>加载模板和域名配置</strong> - CustomTemplate 和 Domain</li>
          <li><strong>调用三方 API 获取变量</strong>
            <ul style="margin: 8px 0; color: #666; font-size: 0.9em;">
              <li>使用 <code>PROTO_API_URL</code> 环境变量配置的API地址</li>
              <li>携带 host 和 path 参数查询动态变量</li>
            </ul>
          </li>
          <li><strong>合并变量</strong> - 优先级: API变量 > 模板变量 > 域名变量</li>
          <li><strong>渲染并返回 HTML</strong></li>
        </ol>
      </div>

      <div class="card">
        <h2>💡 路由匹配示例</h2>
        <pre><code>// 精确匹配
pattern: "/home", type: "exact"
✓ 匹配: /home
✗ 不匹配: /home/about, /homepage

// 通配符匹配
pattern: "/blog/*", type: "wildcard"
✓ 匹配: /blog/post-1, /blog/2023/article
✗ 不匹配: /news/blog

// 正则匹配
pattern: "^/product/\\\\d+$", type: "regex"
✓ 匹配: /product/123, /product/456
✗ 不匹配: /product/abc, /product</code></pre>
      </div>

      <div class="card">
        <h2>🔗 三方 API 变量查询</h2>
        <p><strong>配置方式：</strong></p>

        <p><strong>环境变量配置</strong></p>
        <pre><code># .env 文件
PROTO_API_URL=https://joymeet-api-develop.ailuoy.ijunj.com/web/v1/proto_config

# 系统会调用：
GET \${PROTO_API_URL}?host=blaze.com&path=/proto/terms</code></pre>

        <p><strong>请求参数：</strong></p>
        <ul style="color: #666; margin: 12px 0; padding-left: 20px;">
          <li><code>host</code> - 域名（开发环境使用 DEV_HOST，生产环境从 x-forwarded-host 提取）</li>
          <li><code>path</code> - 路由路径（例如 /proto/terms）</li>
        </ul>

        <p><strong>API 响应示例：</strong></p>
        <pre><code>// API 返回的变量会以最高优先级合并到模板中
{
  "title": "Privacy Policy",
  "description": "Dynamic content from API",
  "custom_var": "any value"
}</code></pre>
      </div>

      <div class="card">
        <h2>⚙️ 环境变量配置</h2>
        <pre><code># .env 文件配置
NODE_ENV=development          # 环境模式
DEV_HOST=blaze.com           # 开发环境测试域名
PROTO_API_URL=https://...    # 三方API地址
MONGODB_URI=mongodb://...    # 数据库连接
JWT_SECRET=your-secret       # JWT密钥</code></pre>
        <p style="margin-top: 12px; color: #666;">
          💡 <strong>提示：</strong>开发环境下，访问 <code>localhost:3001/any-path</code>
          会自动使用 <code>DEV_HOST</code> 作为域名查询数据库，方便直接测试 admin 中配置的真实域名数据。
        </p>
      </div>

      <div class="card">
        <h2>📝 使用说明</h2>
        <ul>
          <li><strong>任意路径访问</strong> - 直接访问任何路径，如 <code>http://localhost:3001/about</code></li>
          <li><strong>清除缓存</strong> - <code>POST /clear-cache</code> (可选参数: domain)</li>
          <li><strong>健康检查</strong> - <code>GET /health</code></li>
          <li><strong>路由测试工具</strong> - 访问 <a href="http://localhost:3002/public/example.html" target="_blank" style="color: #667eea;">http://localhost:3002/public/example.html</a></li>
        </ul>
      </div>
    </body>
    </html>
  `;
}
