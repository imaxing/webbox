# Webbox 服务管理脚本

本目录包含用于管理 Webbox 项目所有服务的脚本。提供两种运行模式：**普通模式** 和 **PM2 守护模式**。

## 📋 目录结构

```
scripts/
├── README.md                  # 本文档
├── start-all.sh              # 普通模式：启动所有服务
├── stop-all.sh               # 普通模式：停止所有服务
├── restart-all.sh            # 普通模式：重启所有服务
├── kill-ports.sh             # 端口清理工具（NEW！）
├── pm2-start.sh              # PM2模式：启动所有服务（推荐）
├── pm2-stop.sh               # PM2模式：停止所有服务
├── pm2-restart.sh            # PM2模式：重启所有服务
├── pm2-logs.sh               # PM2模式：查看日志
├── create-test-data.sh       # 创建测试数据
├── clean-test-data.sh        # 清理测试数据
└── test-*.sh                 # 其他测试脚本
```

---

## 🚀 快速开始

### 方式一：PM2 守护模式（推荐）

**特点：进程守护、自动重启、报错不停服**

```bash
# 启动所有服务（守护模式）
bash scripts/pm2-start.sh

# 查看服务状态
pm2 status

# 查看日志
bash scripts/pm2-logs.sh
# 或直接使用 PM2 命令
pm2 logs

# 重启服务
bash scripts/pm2-restart.sh

# 停止服务
bash scripts/pm2-stop.sh
```

### 方式二：普通模式

**特点：简单直接，适合临时测试**

```bash
# 启动所有服务
bash scripts/start-all.sh

# 重启所有服务
bash scripts/restart-all.sh

# 停止所有服务
bash scripts/stop-all.sh
```

---

## 📖 脚本详解

## 🆕 端口清理工具

### `kill-ports.sh` ⭐

**新增功能！** 自动清理所有服务占用的端口，彻底解决 `EADDRINUSE` 错误。

**流程：**
1. 检测端口 3001、3002、3003 占用情况
2. 显示占用进程信息
3. 强制终止占用进程
4. 验证端口已释放

**使用：**
```bash
bash scripts/kill-ports.sh
```

**自动集成：**
- ✅ `start-all.sh` 启动前自动清理端口
- ✅ `pm2-start.sh` 启动前自动清理端口

**输出示例：**
```
检查端口 3003 (Admin 服务)...
✗ 端口 3003 被占用
node    95856 iamgx   17u  IPv6  TCP *:cgms (LISTEN)
  正在终止进程 PID: 95856...
  ✓ 进程 95856 已终止
✓ 端口 3003 已释放
```

---

### 普通模式脚本

#### `start-all.sh`
启动所有服务（API、渲染、Admin）。

**流程：**
1. 检查 MongoDB 状态
2. 安装依赖（如果需要）
3. 构建共享包
4. 依次启动三个服务
5. 健康检查

**使用：**
```bash
bash scripts/start-all.sh
```

**输出：**
- PID 文件：`.api.pid`、`.render.pid`、`.admin.pid`
- 日志文件：`logs/api-service.log`、`logs/render-service.log`、`logs/admin-service.log`

---

#### `stop-all.sh`
停止所有服务。

**流程：**
1. 读取 PID 文件
2. 终止对应进程
3. 清理残留进程
4. 删除 PID 文件

**使用：**
```bash
bash scripts/stop-all.sh
```

---

#### `restart-all.sh`
重启所有服务（先停止再启动）。

**使用：**
```bash
bash scripts/restart-all.sh
```

**注意：** 如果服务报错，可能无法自动恢复，建议使用 PM2 模式。

---

### PM2 守护模式脚本（推荐）

#### `pm2-start.sh`
使用 PM2 启动所有服务，提供进程守护和自动重启功能。

**特点：**
- ✅ 自动重启：服务崩溃后自动恢复
- ✅ 内存监控：超过阈值自动重启
- ✅ 日志管理：自动记录和轮转日志
- ✅ 进程监控：实时查看 CPU、内存使用
- ✅ 错误恢复：最多重启10次，指数退避延迟

**使用：**
```bash
bash scripts/pm2-start.sh
```

**首次运行会自动安装 PM2：**
```bash
npm install -g pm2
```

---

#### `pm2-stop.sh`
停止所有 PM2 管理的服务。

**使用：**
```bash
bash scripts/pm2-stop.sh
```

**注意：** 服务停止后仍在 PM2 进程列表中，可以快速重启。

**完全删除进程：**
```bash
pm2 delete all
```

---

#### `pm2-restart.sh`
重启所有 PM2 管理的服务。

**使用：**
```bash
bash scripts/pm2-restart.sh
```

**优势：** 零停机时间，平滑重启。

---

#### `pm2-logs.sh`
交互式日志查看工具。

**使用：**
```bash
# 交互式菜单
bash scripts/pm2-logs.sh

# 直接查看指定服务
bash scripts/pm2-logs.sh admin-service
```

**菜单选项：**
- `1` - 所有服务
- `2` - API 服务
- `3` - 渲染服务
- `4` - Admin 服务
- `5` - 查看服务状态

---

## 🔧 PM2 配置文件

### `ecosystem.config.js`

位于项目根目录，定义了所有服务的 PM2 配置。

**关键配置：**

```javascript
{
  autorestart: true,              // 自动重启
  max_restarts: 10,               // 最多重启10次
  min_uptime: '10s',              // 至少运行10秒才算启动成功
  max_memory_restart: '500M',     // 内存超过500M自动重启
  restart_delay: 3000,            // 重启延迟3秒
  exp_backoff_restart_delay: 100, // 指数退避重启
}
```

**日志配置：**
- API 服务：`logs/pm2-api-error.log`、`logs/pm2-api-out.log`
- 渲染服务：`logs/pm2-render-error.log`、`logs/pm2-render-out.log`
- Admin 服务：`logs/pm2-admin-error.log`、`logs/pm2-admin-out.log`

---

## 📊 PM2 常用命令

```bash
# 查看服务状态
pm2 status

# 查看所有日志（实时）
pm2 logs

# 查看某个服务的日志
pm2 logs api-service
pm2 logs render-service
pm2 logs admin-service

# 查看监控面板
pm2 monit

# 重启单个服务
pm2 restart api-service

# 停止单个服务
pm2 stop admin-service

# 删除服务
pm2 delete api-service

# 删除所有服务
pm2 delete all

# 保存当前进程列表（开机自启动）
pm2 save
pm2 startup
```

---

## 🌐 服务访问地址

启动成功后，可以通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **API 服务** | http://localhost:3002 | 后端 API |
| API 健康检查 | http://localhost:3002/health | - |
| API 文档 | http://localhost:3002/api-docs | Swagger 文档 |
| **渲染服务** | http://localhost:3001 | 前端渲染 |
| 渲染健康检查 | http://localhost:3001/health | - |
| Demo 页面 | http://localhost:3001/demo | - |
| **Admin 服务** | http://localhost:3003 | 管理后台 |

---

## 🛠️ 故障排查

### 问题1：端口被占用 ⭐

**现象：** `EADDRINUSE: address already in use`

**解决方案（推荐）：** 使用端口清理工具
```bash
# 一键清理所有服务端口（3001, 3002, 3003）
bash scripts/kill-ports.sh
```

**手动清理：**
```bash
# 查看占用端口的进程
lsof -i :3003

# 杀掉占用端口的进程
kill -9 <PID>
```

**好消息：** 现在启动脚本会自动调用端口清理工具，无需手动处理！

---

### 问题2：服务启动失败

**现象：** 服务启动后立即退出

**排查：**
```bash
# 查看日志
tail -f logs/admin-service.log

# PM2 模式查看日志
pm2 logs admin-service

# 检查依赖是否安装
npm install
```

---

### 问题3：PM2 命令找不到

**现象：** `pm2: command not found`

**解决：**
```bash
# 安装 PM2
npm install -g pm2

# 或使用 npx
npx pm2 status
```

---

### 问题4：Admin 服务报错后断开

**原因：** 普通模式下，服务崩溃不会自动重启

**解决方案：** 使用 PM2 守护模式

```bash
# 停止普通模式服务
bash scripts/stop-all.sh

# 启动 PM2 守护模式
bash scripts/pm2-start.sh
```

PM2 会自动监控服务状态，崩溃后自动重启。

---

## 📝 最佳实践

### 开发环境

**推荐使用 PM2 模式：**
```bash
bash scripts/pm2-start.sh
```

**优势：**
- 代码报错不影响服务运行
- 自动恢复，无需手动重启
- 实时日志查看
- 性能监控

### 临时测试

**可使用普通模式：**
```bash
bash scripts/start-all.sh
```

**适用场景：**
- 快速测试功能
- 不需要长时间运行
- 调试特定问题

---

## 🔄 版本对比

| 特性 | 普通模式 | PM2 守护模式 |
|------|----------|--------------|
| 启动速度 | ⚡ 快 | 🐢 稍慢 |
| 自动重启 | ❌ 否 | ✅ 是 |
| 进程守护 | ❌ 否 | ✅ 是 |
| 日志管理 | ⚠️ 基础 | ✅ 完善 |
| 性能监控 | ❌ 无 | ✅ 有 |
| 内存监控 | ❌ 无 | ✅ 有 |
| 适用场景 | 临时测试 | **生产开发** |

---

## 💡 提示

1. **首次使用推荐 PM2 模式**，确保服务稳定运行
2. **定期查看日志**，及时发现潜在问题
3. **MongoDB 必须先启动**，否则服务会报错
4. **使用 `pm2 monit`** 可以实时监控资源使用情况
5. **重要操作前**，建议先停止所有服务

---

## 📞 获取帮助

如果遇到问题，请：

1. 查看日志：`bash scripts/pm2-logs.sh`
2. 检查服务状态：`pm2 status`
3. 查看监控：`pm2 monit`
4. 查看本文档的故障排查部分

---

**Happy Coding! 🚀**
