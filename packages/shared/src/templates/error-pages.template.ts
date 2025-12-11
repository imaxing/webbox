/**
 * 错误页面HTML模板
 * 提供404和500错误页面的HTML生成函数
 */

/**
 * 404 页面模板
 */
export const notFoundPage = ({ path, host }: { path: string; host: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    h1 { font-size: 72px; margin: 0; }
    p { font-size: 24px; margin: 20px 0; }
    code { background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>页面未找到</p>
    <p><code>${host}${path}</code></p>
    <p style="font-size: 16px; opacity: 0.8;">未配置匹配的路由规则</p>
  </div>
</body>
</html>
`;

/**
 * 500 错误页面模板
 */
export const errorPage = ({ message }: { message?: string }): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 Internal Server Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f44336;
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(0,0,0,0.2);
      border-radius: 16px;
      max-width: 600px;
    }
    h1 { font-size: 48px; margin: 0; }
    pre {
      background: rgba(0,0,0,0.3);
      padding: 20px;
      border-radius: 8px;
      text-align: left;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>500</h1>
    <p>服务器内部错误</p>
    <pre>${message || 'An unexpected error occurred'}</pre>
  </div>
</body>
</html>
`;
