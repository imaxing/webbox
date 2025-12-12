#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录（脚本在scripts目录下，需要返回上一级）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$PROJECT_ROOT/scripts"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Webbox 服务重启脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止所有服务
echo -e "${YELLOW}[1/2] 停止所有服务...${NC}"
bash "$SCRIPT_DIR/stop-all.sh"

echo ""
echo -e "${YELLOW}等待服务完全停止...${NC}"
sleep 3

# 启动所有服务
echo -e "${YELLOW}[2/2] 启动所有服务...${NC}"
bash "$SCRIPT_DIR/start-all.sh"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    服务重启完成！${NC}"
echo -e "${GREEN}========================================${NC}"
