import dotenv from 'dotenv';
import { resolve } from 'path';

// 加载项目根目录的 .env 文件
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, db, notFoundPage, errorPage, generateRenderDemoHtml } from '@webbox/shared';
import { routeResolver } from '@/services/route-resolver.service';

const app = express();

// 中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许渲染任意 HTML
}));
app.use(cors());
app.use(express.json());

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'render-service',
    timestamp: new Date().toISOString(),
    database: db.getConnectionStatus() ? 'connected' : 'disconnected',
  });
});

/**
 * 清除缓存接口
 */
app.post('/clear-cache', (req, res) => {
  const { domain } = req.body;
  const count = routeResolver.clearCache(domain);
  res.json({
    success: true,
    message: `清除了 ${count} 条缓存`,
    count
  });
});

/**
 * 示例演示页面
 */
app.get('/demo', async (req, res) => {
  try {
    res.type('html').send(generateRenderDemoHtml({
      host: req.get('host') || 'localhost',
      path: '/demo',
      dbConnected: db.getConnectionStatus(),
      nodeEnv: process.env.NODE_ENV || 'development',
      devHost: process.env.DEV_HOST || '未设置',
      protoApiUrl: process.env.PROTO_API_URL || '未配置'
    }));
  } catch (error: any) {
    res.status(500).send(`<h1>Error:</h1><pre>${error.message}</pre>`);
  }
});

/**
 * 通配路由 - 处理所有路径
 * 这是核心功能：根据 host + path 动态渲染页面
 */
app.get('*', async (req: Request, res: Response) => {
  try {
    // 1. 提取 path
    const path = req.path;

    // 2. 提取 host（支持 localhost 测试）
    let host: string;

    if (process.env.NODE_ENV === 'development') {
      // 开发环境：使用固定的 DEV_HOST 用于测试
      // 这样可以在 localhost 环境测试 admin 中配置的真实域名数据
      host = process.env.DEV_HOST || 'localhost';
    } else {
      // 生产环境：从 x-forwarded-host 头获取真实域名
      // 提取主域名（比如 blaze.com）
      const forwardedHost = req.get('x-forwarded-host');
      if (forwardedHost) {
        host = forwardedHost.split('.').slice(-2).join('.');
      } else {
        host = req.get('host')?.split(':')[0] || 'localhost';
      }
    }

    console.log(`📍 ${host}${path}`);

    // 2. 解析路由并获取模板和变量
    const result = await routeResolver.resolve(host, path);

    if (!result) {
      // 未找到匹配的路由
      res.status(404).type('html; charset=utf-8').send(notFoundPage({ path, host }));
      return;
    }

    // 3. 渲染模板
    const html = routeResolver.renderTemplate(result.template, result.variables);

    console.log(`✅ ${result.templateName}`);

    // 4. 返回渲染结果
    res.type('html').send(html);

  } catch (error: any) {
    console.error('❌', error.message);
    res.status(500).type('html; charset=utf-8').send(errorPage({ message: error.message }));
  }
});

// 启动服务
const PORT = process.env.RENDER_PORT || 3001;

async function startServer() {
  try {
    // 连接数据库
    await db.connect();

    // 启动HTTP服务
    app.listen(PORT, () => {
      console.log(`🎨 Render Service is running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 Demo page: http://localhost:${PORT}/demo`);
      console.log(`🌐 Wildcard routing: All paths will be processed`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
      console.log(`🏠 DEV_HOST: ${process.env.DEV_HOST || '(not set)'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
