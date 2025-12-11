# Webbox Monorepo

一个基于 Monorepo 架构的多服务系统，包含渲染服务、API 服务和管理后台。

## 🏗️ 项目结构

```
webbox-nextjs/
├── packages/
│   ├── shared/           # 共享代码（Models, Env, Utils)
│   ├── render-service/   # HTML 渲染服务 (端口 3001)
│   ├── api-service/      # RESTful API 服务 (端口 3002)
│   └── admin-service/    # Next.js 管理后台 (端口 3003)
├── docker-compose.yml    # Docker 编排配置
└── package.json          # Workspace 配置
```

## 📦 服务说明

### 1. Render Service (渲染服务)
- **端口**: 3001
- **功能**: 根据 host + path 从数据库读取模板和变量，渲染 HTML 返回
- **技术栈**: Express + Mongoose + Mustache

### 2. API Service (API 服务)
- **端口**: 3002
- **功能**: 提供 RESTful API 操作数据库（模板、域名、路由规则、用户等）
- **技术栈**: Express + Mongoose

### 3. Admin Service (管理后台)
- **端口**: 3003
- **功能**: 管理界面，提供登录认证和数据管理功能
- **技术栈**: Next.js 16 + React 19

### 4. Shared Package (共享代码)
- **功能**:
  - 数据模型 (Models): BaseTemplate, CustomTemplate, Domain, RouteRule, User
  - 环境配置 (Env)
  - 工具函数 (Utils)

## 🚀 快速开始

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置 MongoDB 连接等信息
```

3. **启动 MongoDB**
```bash
# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# 或使用本地安装的 MongoDB
mongod
```

4. **启动服务**

启动所有服务:
```bash
# 渲染服务
npm run dev:render

# API 服务
npm run dev:api

# Admin 服务
npm run dev:admin
```

### Docker 部署

1. **构建并启动所有服务**
```bash
docker-compose up -d
```

2. **查看服务状态**
```bash
docker-compose ps
```

3. **查看日志**
```bash
docker-compose logs -f
```

4. **停止服务**
```bash
docker-compose down
```

## 📡 API 端点

### Render Service (3001)
- `GET /health` - 健康检查
- `GET /demo` - 演示页面
- `GET /render?host=xxx&path=xxx` - 渲染指定模板
- `GET /template-info?host=xxx&path=xxx` - 获取模板信息

### API Service (3002)
- `GET /health` - 健康检查
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/users` - 创建用户
- `GET /api/templates` - 获取所有模板
- `GET /api/templates/query?host=xxx&path=xxx` - 查询模板
- `POST /api/templates` - 创建模板
- `PUT /api/templates/:id` - 更新模板
- `DELETE /api/templates/:id` - 删除模板

### Admin Service (3003)
- `/` - 登录页面
- `/dashboard` - 管理仪表盘 (待实现)

## 🧪 Demo 测试流程

### 1. 创建管理员用户
```bash
curl -X POST http://localhost:3002/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

### 2. 测试登录
打开浏览器访问: `http://localhost:3003`
- 用户名: admin
- 密码: admin123

### 3. 查看渲染服务演示
打开浏览器访问: `http://localhost:3001/demo`

### 4. 测试 API 服务健康检查
```bash
curl http://localhost:3002/health
```

## 📝 数据模型

### BaseTemplate (公共模板库)
- 存储可复用的通用模板
- 支持变量配置

### CustomTemplate (定制模板实例)
- 基于公共模板创建的定制化实例
- 绑定到特定域名

### Domain (域名配置)
- 域名级别的全局配置
- 应用名称、联系邮箱等

### RouteRule (路由规则)
- URL 路由模式映射到具体模板
- 支持精确匹配、通配符、正则表达式

### User (用户)
- 后台管理系统的用户认证
- 支持多角色权限管理

## 🛠️ 技术栈

- **前端**: Next.js 16, React 19
- **后端**: Node.js, Express, TypeScript
- **数据库**: MongoDB + Mongoose
- **模板引擎**: Mustache
- **容器化**: Docker, Docker Compose
- **包管理**: npm workspaces

## 📄 License

MIT
