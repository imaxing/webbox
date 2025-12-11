#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  停止所有 Webbox 服务${NC}"
echo -e "${BLUE}=======================================${NC}"

# 从 PID 文件读取并停止服务
stop_service() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}停止 $service_name (PID: $pid)...${NC}"
            kill $pid
            echo -e "${GREEN}✓ $service_name 已停止${NC}"
        else
            echo -e "${YELLOW}⚠ $service_name 进程不存在${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠ 未找到 $service_name 的 PID 文件${NC}"
    fi
}

stop_service ".api.pid" "API 服务"
stop_service ".render.pid" "渲染服务"
stop_service ".admin.pid" "Admin 服务"

# 额外清理：杀掉所有相关进程
echo -e "\n${YELLOW}清理残留进程...${NC}"
pkill -f "tsx.*api-service" 2>/dev/null && echo -e "${GREEN}✓ 清理 API 服务进程${NC}"
pkill -f "tsx.*render-service" 2>/dev/null && echo -e "${GREEN}✓ 清理渲染服务进程${NC}"
pkill -f "next.*admin-service" 2>/dev/null && echo -e "${GREEN}✓ 清理 Admin 服务进程${NC}"

echo -e "\n${GREEN}✓ 所有服务已停止${NC}"
echo -e "${BLUE}=======================================${NC}"
