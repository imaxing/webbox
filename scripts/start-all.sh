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
echo -e "${BLUE}    Webbox 服务一键启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 清理占用的端口
echo -e "${YELLOW}[0/7] 清理占用的端口...${NC}"
SCRIPT_DIR="$PROJECT_ROOT/scripts"
bash "$SCRIPT_DIR/kill-ports.sh"
echo ""

# 检查 MongoDB 是否运行
echo -e "${YELLOW}[1/7] 检查 MongoDB 状态...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${RED}✗ MongoDB 未运行${NC}"
    echo -e "${YELLOW}正在尝试启动 MongoDB...${NC}"

    # 尝试使用 brew 启动
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
echo -e "${YELLOW}[2/7] 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已就绪${NC}"
fi
echo ""

# 构建 shared 包
echo -e "${YELLOW}[3/7] 构建共享包...${NC}"
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

# 清理旧的 PID 文件
echo -e "${YELLOW}[4/7] 清理旧的 PID 文件...${NC}"
rm -f "$PROJECT_ROOT/.api.pid"
rm -f "$PROJECT_ROOT/.render.pid"
rm -f "$PROJECT_ROOT/.admin.pid"
echo -e "${GREEN}✓ PID 文件已清理${NC}"
echo ""

# 启动 API 服务
echo -e "${YELLOW}[5/7] 启动 API 服务 (端口 3002)...${NC}"
cd "$PROJECT_ROOT/packages/api-service"
npm run dev > "$PROJECT_ROOT/logs/api-service.log" 2>&1 &
API_PID=$!
echo $API_PID > "$PROJECT_ROOT/.api.pid"
echo -e "${GREEN}✓ API 服务已启动 (PID: $API_PID)${NC}"
cd "$PROJECT_ROOT"
echo ""

# 等待 API 服务启动
sleep 3

# 启动渲染服务
echo -e "${YELLOW}[6/7] 启动渲染服务 (端口 3001)...${NC}"
cd "$PROJECT_ROOT/packages/render-service"
npm run dev > "$PROJECT_ROOT/logs/render-service.log" 2>&1 &
RENDER_PID=$!
echo $RENDER_PID > "$PROJECT_ROOT/.render.pid"
echo -e "${GREEN}✓ 渲染服务已启动 (PID: $RENDER_PID)${NC}"
cd "$PROJECT_ROOT"
echo ""

# 启动 Admin 服务
echo -e "${YELLOW}[7/7] 启动 Admin 服务 (端口 3003)...${NC}"
cd "$PROJECT_ROOT/packages/admin-service"
npm run dev > "$PROJECT_ROOT/logs/admin-service.log" 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > "$PROJECT_ROOT/.admin.pid"
echo -e "${GREEN}✓ Admin 服务已启动 (PID: $ADMIN_PID)${NC}"
cd "$PROJECT_ROOT"
echo ""

# 等待服务完全启动
echo -e "${YELLOW}等待服务完全启动...${NC}"
sleep 5

# 服务健康检查
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    服务状态检查${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

check_service() {
    local name=$1
    local port=$2
    local url=$3

    if curl -s "http://localhost:$port$url" > /dev/null; then
        echo -e "${GREEN}✓ $name${NC} - http://localhost:$port"
    else
        echo -e "${RED}✗ $name${NC} - http://localhost:$port (可能还在启动中)"
    fi
}

check_service "API 服务" "3002" "/health"
check_service "渲染服务" "3001" "/health"
check_service "Admin 服务" "3003" "/"

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
echo -e "${GREEN}📊 测试页面:${NC}"
echo -e "   打开: file://$PROJECT_ROOT/public/index.html"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   - 查看日志: tail -f logs/*.log"
echo -e "   - 停止服务: ./stop-all.sh"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    所有服务启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"
