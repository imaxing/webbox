#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录（脚本在scripts目录下，需要返回上一级）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    PM2 守护模式启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 清理占用的端口
echo -e "${YELLOW}[0/5] 清理占用的端口...${NC}"
SCRIPT_DIR="$PROJECT_ROOT/scripts"
bash "$SCRIPT_DIR/kill-ports.sh"
echo ""

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}✗ PM2 未安装${NC}"
    echo -e "${YELLOW}正在安装 PM2...${NC}"
    npm install -g pm2
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PM2 安装成功${NC}"
    else
        echo -e "${RED}✗ PM2 安装失败，请手动安装: npm install -g pm2${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ PM2 已安装${NC}"
fi
echo ""

# 检查 MongoDB 是否运行
echo -e "${YELLOW}[1/5] 检查 MongoDB 状态...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${RED}✗ MongoDB 未运行${NC}"
    echo -e "${YELLOW}正在尝试启动 MongoDB...${NC}"

    if command -v brew &> /dev/null; then
        brew services start mongodb-community &> /dev/null || brew services start mongodb &> /dev/null
        sleep 3

        if pgrep -x "mongod" > /dev/null; then
            echo -e "${GREEN}✓ MongoDB 已启动${NC}"
        else
            echo -e "${RED}✗ 无法自动启动 MongoDB，请手动启动${NC}"
            exit 1
        fi
    else
        echo -e "${RED}请先手动启动 MongoDB${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ MongoDB 正在运行${NC}"
fi
echo ""

# 检查并安装依赖
echo -e "${YELLOW}[2/5] 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已就绪${NC}"
fi
echo ""

# 构建 shared 包
echo -e "${YELLOW}[3/5] 构建共享包...${NC}"
cd "$PROJECT_ROOT/packages/shared"
if [ ! -d "dist" ]; then
    npm run build
    echo -e "${GREEN}✓ 共享包构建完成${NC}"
else
    echo -e "${GREEN}✓ 共享包已构建${NC}"
fi
cd "$PROJECT_ROOT"
echo ""

# 创建日志目录
mkdir -p logs

# 停止可能存在的 PM2 进程
echo -e "${YELLOW}[4/5] 停止旧的 PM2 进程...${NC}"
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true
echo -e "${GREEN}✓ 旧进程已清理${NC}"
echo ""

# 使用 PM2 启动服务
echo -e "${YELLOW}[5/5] 使用 PM2 启动所有服务...${NC}"
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 所有服务已启动${NC}"
    echo ""

    # 等待服务启动
    echo -e "${YELLOW}等待服务完全启动...${NC}"
    sleep 5

    # 显示服务状态
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    服务状态${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    pm2 status

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    快速链接${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${GREEN}📡 API 服务:${NC}"
    echo -e "   健康检查: http://localhost:3002/health"
    echo -e "   API 文档: http://localhost:3002/api-docs"
    echo ""
    echo -e "${GREEN}🎨 渲染服务:${NC}"
    echo -e "   健康检查: http://localhost:3001/health"
    echo -e "   Demo 页面: http://localhost:3001/demo"
    echo ""
    echo -e "${GREEN}🔧 Admin 服务:${NC}"
    echo -e "   管理后台: http://localhost:3003"
    echo ""
    echo -e "${YELLOW}💡 PM2 常用命令:${NC}"
    echo -e "   - 查看状态: pm2 status"
    echo -e "   - 查看日志: pm2 logs"
    echo -e "   - 重启服务: pm2 restart all (或 bash scripts/pm2-restart.sh)"
    echo -e "   - 停止服务: pm2 stop all (或 bash scripts/pm2-stop.sh)"
    echo -e "   - 查看监控: pm2 monit"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    服务启动完成（守护模式）${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo ""
    echo -e "${RED}✗ 服务启动失败${NC}"
    exit 1
fi
