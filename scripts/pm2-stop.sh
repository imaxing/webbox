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
echo -e "${BLUE}    PM2 停止服务脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}✗ PM2 未安装${NC}"
    exit 1
fi

# 停止所有服务
echo -e "${YELLOW}正在停止所有服务...${NC}"
pm2 stop ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 所有服务已停止${NC}"
    echo ""

    # 显示服务状态
    pm2 status

    echo ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo -e "   - 服务已停止但仍在 PM2 进程列表中"
    echo -e "   - 要完全删除进程: pm2 delete all"
    echo -e "   - 要重新启动: bash scripts/pm2-start.sh"
    echo ""
else
    echo -e "${RED}✗ 停止服务失败${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    服务停止完成${NC}"
echo -e "${GREEN}========================================${NC}"
