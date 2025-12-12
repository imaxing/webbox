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
echo -e "${BLUE}    PM2 重启服务脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}✗ PM2 未安装${NC}"
    echo -e "${YELLOW}请先使用 PM2 启动服务: bash scripts/pm2-start.sh${NC}"
    exit 1
fi

# 重启所有服务
echo -e "${YELLOW}正在重启所有服务...${NC}"
pm2 restart ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 所有服务已重启${NC}"
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
    echo -e "${YELLOW}💡 提示:${NC}"
    echo -e "   - 查看实时日志: pm2 logs"
    echo -e "   - 查看某个服务日志: pm2 logs admin-service"
    echo -e "   - 查看监控: pm2 monit"
    echo ""
else
    echo -e "${RED}✗ 重启服务失败${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    服务重启完成${NC}"
echo -e "${GREEN}========================================${NC}"
