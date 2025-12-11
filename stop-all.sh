#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Webbox 服务停止脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止服务函数
stop_service() {
    local name=$1
    local pid_file=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}正在停止 $name (PID: $pid)...${NC}"
            kill $pid
            sleep 2

            # 如果进程还在运行，强制杀死
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${RED}强制停止 $name...${NC}"
                kill -9 $pid
            fi

            echo -e "${GREEN}✓ $name 已停止${NC}"
        else
            echo -e "${YELLOW}⚠ $name 未运行 (PID: $pid)${NC}"
        fi

        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠ 未找到 $name 的 PID 文件${NC}"
    fi
}

# 停止各个服务
stop_service "API 服务" ".api.pid"
stop_service "渲染服务" ".render.pid"
stop_service "Admin 服务" ".admin.pid"

echo ""
echo -e "${YELLOW}清理残留进程...${NC}"

# 清理可能的残留进程
pkill -f "tsx.*api-service" 2>/dev/null
pkill -f "tsx.*render-service" 2>/dev/null
pkill -f "next.*admin-service" 2>/dev/null

echo -e "${GREEN}✓ 清理完成${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
