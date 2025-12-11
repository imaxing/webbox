# Webbox Monorepo

一个基于 Monorepo 架构的多服务系统，包含渲染服务、API 服务和管理后台。

## 🚀 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动 MongoDB
mongod

# 3. 启动服务（三个终端）
npm run dev:api      # API 服务 (3002)
npm run dev:render   # 渲染服务 (3001)
npm run dev:admin    # Admin 服务 (3003)
```

### Docker 部署

```bash
docker-compose up -d
```

## 📖 测试页面

打开浏览器访问: **[http://localhost:8080](file:///Users/iamgx/panda/webbox-nextjs/public/index.html)** （双击 `public/index.html`）

或者使用简单 HTTP 服务器：
```bash
npx http-server public -p 8080
```

## 📡 服务端口

- **渲染服务**: http://localhost:3001
- **API 服务**: http://localhost:3002
- **Admin 服务**: http://localhost:3003
- **MongoDB**: localhost:27017

## 📚 详细文档

- [完整文档](./docs/README.md) - 项目概述和快速开始
- [Demo 指南](./docs/DEMO.md) - 详细的测试流程
- [架构设计](./docs/ARCHITECTURE.md) - 完整的架构设计文档

## 🧪 快速测试

```bash
# 1. 创建管理员用户
curl -X POST http://localhost:3002/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@example.com","role":"admin"}'

# 2. 访问管理后台
open http://localhost:3003

# 3. 查看 API 文档
open http://localhost:3002/api-docs
```

## 📦 项目结构

```
webbox-nextjs/
├── packages/
│   ├── shared/           # 共享代码（Models, Env, Utils）
│   ├── render-service/   # 渲染服务 (3001)
│   ├── api-service/      # API 服务 (3002)
│   └── admin-service/    # Admin 服务 (3003)
├── public/               # 静态测试页面
├── docs/                 # 项目文档
└── docker-compose.yml    # Docker 编排
```

## 📝 License

MIT
