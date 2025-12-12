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
echo -e "${BLUE}    PM2 日志查看工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}✗ PM2 未安装${NC}"
    exit 1
fi

# 如果有参数，查看指定服务的日志
if [ $# -gt 0 ]; then
    echo -e "${YELLOW}查看 $1 服务的日志...${NC}"
    echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
    echo ""
    pm2 logs "$1"
else
    # 没有参数，显示菜单
    echo -e "${YELLOW}请选择要查看的日志:${NC}"
    echo -e "  ${GREEN}1${NC} - 所有服务"
    echo -e "  ${GREEN}2${NC} - API 服务"
    echo -e "  ${GREEN}3${NC} - 渲染服务"
    echo -e "  ${GREEN}4${NC} - Admin 服务"
    echo -e "  ${GREEN}5${NC} - 查看服务状态"
    echo -e "  ${GREEN}0${NC} - 退出"
    echo ""
    read -p "请输入选项 [0-5]: " choice

    case $choice in
        1)
            echo -e "${YELLOW}查看所有服务日志...${NC}"
            echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
            echo ""
            pm2 logs
            ;;
        2)
            echo -e "${YELLOW}查看 API 服务日志...${NC}"
            echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
            echo ""
            pm2 logs api-service
            ;;
        3)
            echo -e "${YELLOW}查看渲染服务日志...${NC}"
            echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
            echo ""
            pm2 logs render-service
            ;;
        4)
            echo -e "${YELLOW}查看 Admin 服务日志...${NC}"
            echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
            echo ""
            pm2 logs admin-service
            ;;
        5)
            echo -e "${YELLOW}服务状态:${NC}"
            echo ""
            pm2 status
            echo ""
            echo -e "${YELLOW}💡 提示:${NC}"
            echo -e "   - 查看监控: pm2 monit"
            echo -e "   - 重启服务: bash scripts/pm2-restart.sh"
            ;;
        0)
            echo -e "${GREEN}退出${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项${NC}"
            exit 1
            ;;
    esac
fi
