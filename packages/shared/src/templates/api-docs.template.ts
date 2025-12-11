/**
 * API 文档页面HTML模板
 * 生成完整的API文档页面，包含登录功能和cURL命令复制
 */
export function generateApiDocsHtml(baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Webbox API 文档</title>
      ${getApiDocsStyles()}
    </head>
    <body>
      <div class="container">
        ${getHeader()}
        ${getLoginBar()}
        ${getAuthSection(baseUrl)}
        ${getUserSection(baseUrl)}
        ${getRouteSection(baseUrl)}
        ${getDomainSection(baseUrl)}
        ${getTemplateSection(baseUrl)}
        ${getMenuSection(baseUrl)}
        ${getUsageSection()}
      </div>
      ${getApiDocsScripts(baseUrl)}
    </body>
    </html>
  `;
}

function getApiDocsStyles(): string {
  return `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f7fa;
          padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 10px; }
        .subtitle { color: #666; }
        .section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h2 {
          color: #333;
          border-bottom: 3px solid #4CAF50;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .api-item {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
          position: relative;
        }
        .copy-btn {
          position: absolute;
          right: 15px;
          top: 15px;
          padding: 6px 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }
        .copy-btn:hover {
          background: #45a049;
          transform: scale(1.05);
        }
        .copy-btn:active {
          transform: scale(0.95);
        }
        .copy-btn.copied {
          background: #2196F3;
        }
        .login-bar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 15px 30px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .login-form {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .login-form input {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          width: 150px;
        }
        .login-btn {
          padding: 8px 20px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
        }
        .login-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .login-status {
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .token-display {
          background: rgba(255,255,255,0.2);
          padding: 6px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
        }
        .logout-btn {
          padding: 6px 16px;
          background: rgba(255,255,255,0.3);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s;
        }
        .logout-btn:hover {
          background: rgba(255,255,255,0.4);
        }
        .hidden {
          display: none !important;
        }
        .success-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
        .login-bar.logged-in {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }
        .method {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          margin-right: 10px;
        }
        .get { background: #61affe; color: white; }
        .post { background: #49cc90; color: white; }
        .put { background: #fca130; color: white; }
        .delete { background: #f93e3e; color: white; }
        .endpoint { font-family: monospace; color: #333; font-size: 14px; }
        .description { color: #666; margin-top: 8px; font-size: 14px; }
        .auth-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #ff9800;
          color: white;
          border-radius: 4px;
          font-size: 11px;
          margin-left: 10px;
        }
      </style>
  `;
}

function getHeader(): string {
  return `
        <div class="header">
          <h1>🚀 Webbox API 文档</h1>
          <p class="subtitle">RESTful API 接口文档 - v1.0</p>
        </div>
  `;
}

function getLoginBar(): string {
  return `
        <!-- 登录栏 -->
        <div class="login-bar" id="loginBar">
          <form class="login-form" id="loginForm" onsubmit="login(event); return false;">
            <span style="color: white; font-weight: 600;">🔐 登录获取 Token：</span>
            <input type="text" id="username" name="username" placeholder="用户名" value="admin" autocomplete="username">
            <input type="password" id="password" name="password" placeholder="密码" value="admin123" autocomplete="current-password">
            <button type="submit" class="login-btn">登录</button>
          </form>
          <div class="login-status hidden" id="loginStatus">
            <span id="userDisplay">✓ 已登录</span>
            <span class="token-display" id="tokenDisplay"></span>
            <button class="logout-btn" onclick="logout()">退出</button>
          </div>
        </div>
  `;
}

function getAuthSection(baseUrl: string): string {
  return `
        <div class="section">
          <h2>🔐 认证接口</h2>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/auth/login</span>
            <p class="description">用户登录，返回 JWT token</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/auth/users</span>
            <p class="description">创建新用户（初始化用）</p>
          </div>
        </div>
  `;
}

function getUserSection(baseUrl: string): string {
  return `
        <div class="section">
          <h2>👤 用户管理</h2>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/users</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取用户列表（支持分页、搜索、排序）</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/users/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取单个用户详情</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/users</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">创建新用户</p>
          </div>
          <div class="api-item">
            <span class="method put">PUT</span>
            <span class="endpoint">${baseUrl}/api/admin/users/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">更新用户信息</p>
          </div>
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">${baseUrl}/api/admin/users/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">删除单个用户</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/users/batch-delete</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">批量删除用户</p>
          </div>
        </div>
  `;
}

function getRouteSection(baseUrl: string): string {
  return `
        <div class="section">
          <h2>🗺️ 路由管理</h2>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/routes</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取路由规则列表（支持分页、搜索）</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/routes/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取单个路由规则详情</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/routes</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">创建路由规则</p>
          </div>
          <div class="api-item">
            <span class="method put">PUT</span>
            <span class="endpoint">${baseUrl}/api/admin/routes/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">更新路由规则</p>
          </div>
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">${baseUrl}/api/admin/routes/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">删除路由规则</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/routes/batch-delete</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">批量删除路由规则</p>
          </div>
        </div>
  `;
}

function getDomainSection(baseUrl: string): string {
  return `
        <div class="section">
          <h2>🌐 域名管理</h2>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/domains</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取域名列表（支持分页、搜索）</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/domains/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取单个域名详情</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/domains/options</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取域名选项（用于下拉框）</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/domains/:id/relations</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取域名关联信息（模板、路由、统计）</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/domains</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">创建域名</p>
          </div>
          <div class="api-item">
            <span class="method put">PUT</span>
            <span class="endpoint">${baseUrl}/api/admin/domains/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">更新域名</p>
          </div>
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">${baseUrl}/api/admin/domains/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">删除域名</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/domains/batch-delete</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">批量删除域名</p>
          </div>
        </div>
  `;
}

function getTemplateSection(baseUrl: string): string {
  return `
        <div class="section">
          <h2>📄 模板管理</h2>
          <h3 style="color: #666; font-size: 1em; margin: 15px 0;">基础模板</h3>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取基础模板列表</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取单个基础模板</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates/options</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取基础模板选项（下拉框）</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">创建基础模板</p>
          </div>
          <div class="api-item">
            <span class="method put">PUT</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">更新基础模板</p>
          </div>
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">删除基础模板</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/base-templates/batch-delete</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">批量删除基础模板</p>
          </div>

          <h3 style="color: #666; font-size: 1em; margin: 15px 0;">定制模板</h3>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取定制模板列表</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取单个定制模板</p>
          </div>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates/options</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取定制模板选项（下拉框，可按域名过滤）</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">创建定制模板</p>
          </div>
          <div class="api-item">
            <span class="method put">PUT</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">更新定制模板</p>
          </div>
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates/:id</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">删除定制模板</p>
          </div>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/custom-templates/batch-delete</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">批量删除定制模板</p>
          </div>

          <h3 style="color: #666; font-size: 1em; margin: 15px 0;">模板复制</h3>
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">${baseUrl}/api/admin/templates/copy</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">复制基础模板为定制模板</p>
          </div>
        </div>
  `;
}

function getMenuSection(baseUrl: string): string {
  return `
        <div class="section">
          <h2>📋 菜单配置</h2>
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">${baseUrl}/api/admin/menus</span>
            <span class="auth-badge">需要认证</span>
            <p class="description">获取Admin系统菜单配置</p>
          </div>
        </div>
  `;
}

function getUsageSection(): string {
  return `
        <div class="section">
          <h2>💡 使用说明</h2>
          <div style="color: #666; line-height: 2;">
            <p><strong>🔐 推荐流程：</strong></p>
            <ol style="margin: 10px 0; padding-left: 30px; color: #555;">
              <li>使用顶部登录表单登录（默认账号：admin / admin123）</li>
              <li>登录成功后，点击接口右上角的 <strong>📋 复制 cURL</strong> 按钮</li>
              <li>复制的命令将自动包含真实的 Token，可直接在终端执行</li>
              <li>Token 会保存在浏览器中，刷新页面后无需重新登录</li>
            </ol>
            <p><strong>📚 其他说明：</strong></p>
            <p>• 所有需要认证的接口都需要在请求头中携带 <code>Authorization: Bearer &lt;token&gt;</code></p>
            <p>• 分页参数: <code>?page=1&limit=20</code></p>
            <p>• 排序参数: <code>?sort=-createdAt</code> （负号表示降序）</p>
            <p>• 🧪 <a href="/public/example.html" style="color: #4CAF50; text-decoration: none; font-weight: 600;">路由测试工具</a> - 可视化测试所有域名和路由</p>
          </div>
        </div>
  `;
}

function getApiDocsScripts(baseUrl: string): string {
  return `
      <script>
        let authToken = null;

        // 显示成功提示
        function showToast(message, type = 'success') {
          const toast = document.createElement('div');
          toast.className = 'success-toast';
          toast.textContent = message;
          if (type === 'error') {
            toast.style.background = '#f44336';
          }
          document.body.appendChild(toast);

          setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
              document.body.removeChild(toast);
            }, 300);
          }, 3000);
        }

        // 登录
        async function login(event) {
          if (event) {
            event.preventDefault();
          }

          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;

          if (!username || !password) {
            showToast('请输入用户名和密码', 'error');
            return false;
          }

          try {
            const response = await fetch('${baseUrl}/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            // 检查业务状态码 1003 表示成功
            if (result.code === 1003 && result.data && result.data.token) {
              authToken = result.data.token;
              const userName = result.data.user?.username || username;

              localStorage.setItem('apiDocToken', authToken);
              localStorage.setItem('apiDocUser', userName);

              // 显示登录状态
              document.getElementById('loginForm').classList.add('hidden');
              document.getElementById('loginStatus').classList.remove('hidden');
              document.getElementById('loginBar').classList.add('logged-in');
              document.getElementById('userDisplay').textContent = \`✓ 已登录: \${userName}\`;
              document.getElementById('tokenDisplay').textContent = \`Token: \${authToken.substring(0, 20)}...\`;

              showToast('✓ 登录成功！现在复制的 cURL 命令将包含真实 Token');
            } else {
              showToast('登录失败: ' + (result.message || '未知错误'), 'error');
            }
          } catch (error) {
            console.error('Login error:', error);
            showToast('登录失败: ' + error.message, 'error');
          }

          return false;
        }

        // 退出登录
        function logout() {
          authToken = null;
          localStorage.removeItem('apiDocToken');
          localStorage.removeItem('apiDocUser');

          document.getElementById('loginForm').classList.remove('hidden');
          document.getElementById('loginStatus').classList.add('hidden');
          document.getElementById('loginBar').classList.remove('logged-in');
          document.getElementById('userDisplay').textContent = '✓ 已登录';
          document.getElementById('tokenDisplay').textContent = '';

          showToast('已退出登录', 'success');
        }

        // 生成 curl 命令
        function generateCurl(method, endpoint, needsAuth) {
          let curl = \`curl -X \${method.toUpperCase()} '\${endpoint}'\`;

          // 添加认证头
          if (needsAuth) {
            if (authToken) {
              curl += \` \\\\\\n  -H 'Authorization: Bearer \${authToken}'\`;
            } else {
              curl += \` \\\\\\n  -H 'Authorization: Bearer YOUR_TOKEN'\`;
            }
          }

          // 添加 Content-Type（POST/PUT）
          if (method === 'POST' || method === 'PUT') {
            curl += \` \\\\\\n  -H 'Content-Type: application/json'\`;
            curl += \` \\\\\\n  -d '{}'\`;
          }

          return curl;
        }

        // 复制到剪贴板
        async function copyCurl(button, method, endpoint, needsAuth) {
          // 如果需要认证但未登录，提示用户
          if (needsAuth && !authToken) {
            if (confirm('此接口需要认证，但您尚未登录。\\n\\n是否继续复制（将使用占位符 YOUR_TOKEN）？\\n\\n建议：先登录以获取真实 Token')) {
              // 用户选择继续
            } else {
              return;
            }
          }

          const curl = generateCurl(method, endpoint, needsAuth);

          try {
            await navigator.clipboard.writeText(curl);
            button.textContent = '✓ 已复制';
            button.classList.add('copied');

            setTimeout(() => {
              button.textContent = '📋 复制 cURL';
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
          }
        }

        // 页面加载时检查 localStorage 中的 token
        document.addEventListener('DOMContentLoaded', () => {
          // 检查是否已有 token
          const savedToken = localStorage.getItem('apiDocToken');
          const savedUser = localStorage.getItem('apiDocUser');
          if (savedToken) {
            authToken = savedToken;
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('loginStatus').classList.remove('hidden');
            document.getElementById('loginBar').classList.add('logged-in');
            if (savedUser) {
              document.getElementById('userDisplay').textContent = \`✓ 已登录: \${savedUser}\`;
            }
            document.getElementById('tokenDisplay').textContent = \`Token: \${authToken.substring(0, 20)}...\`;
          }

          // 为所有 API 项添加复制按钮
          const apiItems = document.querySelectorAll('.api-item');

          apiItems.forEach(item => {
            const method = item.querySelector('.method').textContent.trim();
            const endpoint = item.querySelector('.endpoint').textContent.trim();
            const needsAuth = !!item.querySelector('.auth-badge');

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '📋 复制 cURL';
            copyBtn.onclick = () => copyCurl(copyBtn, method, endpoint, needsAuth);

            item.appendChild(copyBtn);
          });
        });
      </script>
  `;
}
