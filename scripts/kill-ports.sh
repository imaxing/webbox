#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Webbox 服务端口
API_PORT=3002
RENDER_PORT=3001
ADMIN_PORT=3003

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    端口清理工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 清理端口函数
kill_port() {
    local port=$1
    local name=$2

    echo -e "${YELLOW}检查端口 $port ($name)...${NC}"

    # 获取占用端口的进程 PID
    local pids=$(lsof -ti :$port)

    if [ -z "$pids" ]; then
        echo -e "${GREEN}✓ 端口 $port 空闲${NC}"
        return 0
    fi

    echo -e "${RED}✗ 端口 $port 被占用${NC}"

    # 显示占用进程信息
    lsof -i :$port | grep LISTEN

    # 杀掉所有占用该端口的进程
    for pid in $pids; do
        echo -e "${YELLOW}  正在终止进程 PID: $pid...${NC}"
        kill -9 $pid 2>/dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✓ 进程 $pid 已终止${NC}"
        else
            echo -e "${RED}  ✗ 无法终止进程 $pid${NC}"
        fi
    done

    # 再次检查
    sleep 1
    pids=$(lsof -ti :$port)
    if [ -z "$pids" ]; then
        echo -e "${GREEN}✓ 端口 $port 已释放${NC}"
    else
        echo -e "${RED}✗ 端口 $port 仍被占用${NC}"
        return 1
    fi

    echo ""
}

# 清理所有服务端口
kill_port $ADMIN_PORT "Admin 服务"
kill_port $API_PORT "API 服务"
kill_port $RENDER_PORT "渲染服务"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}    端口清理完成${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   - 现在可以安全启动服务了"
echo -e "   - PM2 模式: bash scripts/pm2-start.sh"
echo -e "   - 普通模式: bash scripts/start-all.sh"
echo ""
