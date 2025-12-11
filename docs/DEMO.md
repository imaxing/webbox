# Demo 测试指南

## 🎯 项目概述

本项目已经完成重构，采用 Monorepo 架构，包含三个独立服务和一个共享代码包：

1. **Render Service** (端口 3001) - HTML 渲染服务
2. **API Service** (端口 3002) - RESTful API 服务
3. **Admin Service** (端口 3003) - Next.js 管理后台
4. **Shared Package** - 共享的 Models、Env 配置和工具函数

## 📋 已完成的功能

### ✅ Shared Package (共享代码)
- ✅ 从 `~/panda/webbox-admin-api` 导入并转换所有现有 Models 为 TypeScript
- ✅ 数据模型：
  - `BaseTemplate` - 公共模板库
  - `CustomTemplate` - 定制模板实例
  - `Domain` - 域名配置
  - `RouteRule` - 路由规则
  - `User` - 用户认证
- ✅ 工具函数：
  - UUID 生成器
  - 日期时间格式化
  - MongoDB 连接管理
- ✅ 环境配置：统一的 env 配置管理

### ✅ Render Service (渲染服务)
- ✅ Express + Mongoose + Mustache 技术栈
- ✅ 根据 host + path 查询数据库
- ✅ 匹配路由规则和模板
- ✅ 使用 Mustache 渲染 HTML
- ✅ 提供演示页面 `/demo`
- ✅ 提供模板信息接口 `/template-info`

### ✅ API Service (API 服务)
- ✅ Express + Mongoose 技术栈
- ✅ 用户认证接口 (登录、创建用户)
- ✅ 模板管理接口 (CRUD)
- ✅ 健康检查接口
- ✅ 错误处理中间件

### ✅ Admin Service (管理后台)
- ✅ Next.js 16 + React 19
- ✅ 登录页面设计
- ✅ 调用 API 服务进行认证
- ✅ 预留管理功能扩展接口

### ✅ Docker 部署
- ✅ 为三个服务分别创建 Dockerfile
- ✅ 创建 docker-compose.yml 统一编排
- ✅ 包含 MongoDB 容器配置
- ✅ 服务间网络互联配置

## 🚀 快速开始

### 方法一：本地开发模式

#### 1. 安装依赖
\`\`\`bash
npm install
\`\`\`

#### 2. 启动 MongoDB
\`\`\`bash
# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# 或使用本地 MongoDB
mongod
\`\`\`

#### 3. 启动服务

**终端 1 - API 服务：**
\`\`\`bash
npm run dev:api
\`\`\`

**终端 2 - 渲染服务：**
\`\`\`bash
npm run dev:render
\`\`\`

**终端 3 - Admin 服务：**
\`\`\`bash
npm run dev:admin
\`\`\`

### 方法二：使用测试脚本

\`\`\`bash
./test-demo.sh
\`\`\`

### 方法三：Docker Compose（推荐）

\`\`\`bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
\`\`\`

## 🧪 Demo 测试流程

### 1. 测试 API 服务

#### 健康检查
\`\`\`bash
curl http://localhost:3002/health
\`\`\`

预期输出：
\`\`\`json
{
  "status": "ok",
  "service": "api-service",
  "timestamp": "2024-...",
  "database": "connected"
}
\`\`\`

#### 创建管理员用户
\`\`\`bash
curl -X POST http://localhost:3002/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }'
\`\`\`

#### 用户登录
\`\`\`bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
\`\`\`

### 2. 测试渲染服务

#### 访问演示页面
打开浏览器访问：
\`\`\`
http://localhost:3001/demo
\`\`\`

你将看到：
- ✅ 服务状态
- ✅ Host 和 Path 信息
- ✅ 数据库查询结果
- ✅ 使用说明

#### 健康检查
\`\`\`bash
curl http://localhost:3001/health
\`\`\`

### 3. 测试 Admin 服务

#### 访问登录页面
打开浏览器访问：
\`\`\`
http://localhost:3003
\`\`\`

使用以下凭据登录：
- 用户名: `admin`
- 密码: `admin123`

登录成功后会显示用户信息。

### 4. 测试完整流程（可选）

如果需要测试完整的模板渲染流程，需要先创建测试数据：

#### 创建域名配置
\`\`\`bash
curl -X POST http://localhost:3002/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "https://example.com",
    "app_name": "Example App",
    "email": "support@example.com",
    "status": "active"
  }'
\`\`\`

#### 创建公共模板
\`\`\`bash
curl -X POST http://localhost:3002/api/base-templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-template",
    "display_name": "测试模板",
    "category": "other",
    "content": "<html><body><h1>{{app_name}}</h1><p>Contact: {{email}}</p></body></html>",
    "variables": []
  }'
\`\`\`

然后访问渲染服务测试。

## 📁 项目结构

\`\`\`
webbox-nextjs/
├── packages/
│   ├── shared/                    # 共享代码包
│   │   ├── src/
│   │   │   ├── models/           # 数据模型 (从 webbox-admin-api 导入)
│   │   │   │   ├── basetemplate.model.ts
│   │   │   │   ├── customtemplate.model.ts
│   │   │   │   ├── domain.model.ts
│   │   │   │   ├── routerule.model.ts
│   │   │   │   └── user.model.ts
│   │   │   ├── env/              # 环境配置
│   │   │   ├── utils/            # 工具函数
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── render-service/            # 渲染服务
│   │   ├── src/
│   │   │   ├── services/         # 模板服务
│   │   │   └── index.ts          # 主入口
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-service/               # API 服务
│   │   ├── src/
│   │   │   ├── controllers/      # 控制器
│   │   │   ├── routes/           # 路由
│   │   │   └── index.ts          # 主入口
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── admin-service/             # Admin 服务
│       ├── src/
│       │   └── app/              # Next.js App Router
│       ├── Dockerfile
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml             # Docker Compose 配置
├── package.json                   # Workspace 配置
├── test-demo.sh                   # 测试脚本
├── README.md                      # 项目文档
└── DEMO.md                        # 本文件
\`\`\`

## 🎨 技术栈

### 前端
- Next.js 16
- React 19
- 内联 CSS (简单演示，可扩展为 Tailwind CSS)

### 后端
- Node.js 20
- TypeScript 5
- Express 4
- Mongoose 8
- Mustache (模板引擎)

### 数据库
- MongoDB 7

### 工具
- npm workspaces (Monorepo 管理)
- tsx (TypeScript 执行器)
- Docker & Docker Compose

## 📊 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| MongoDB | 27017 | 数据库 |
| Render Service | 3001 | 渲染服务 |
| API Service | 3002 | API 服务 |
| Admin Service | 3003 | 管理后台 |

## 🔍 常见问题

### Q: 服务启动失败？
A: 检查以下几点：
1. MongoDB 是否正常运行
2. 端口是否被占用
3. 依赖是否已安装 (\`npm install\`)
4. shared 包是否已构建 (\`cd packages/shared && npm run build\`)

### Q: 数据库连接失败？
A: 检查环境变量 \`MONGODB_URI\` 是否正确，默认为 \`mongodb://localhost:27017/webbox\`

### Q: Docker Compose 启动失败？
A: 确保 Docker 已安装并运行，执行 \`docker-compose build\` 重新构建镜像

## 📝 下一步开发

1. **Admin 管理功能**
   - 模板管理界面
   - 域名配置界面
   - 路由规则管理
   - 用户权限管理

2. **渲染服务增强**
   - 缓存机制
   - 性能优化
   - 更多模板引擎支持

3. **API 服务增强**
   - 完善所有模型的 CRUD 接口
   - API 文档 (Swagger)
   - 接口权限验证

## 📄 许可证

MIT
