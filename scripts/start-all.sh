#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}  Webbox 一键启动所有服务${NC}"
echo -e "${BLUE}=======================================${NC}"

# 检查 MongoDB
echo -e "\n${YELLOW}[1/4] 检查 MongoDB...${NC}"
if pgrep -x mongod > /dev/null; then
    echo -e "${GREEN}✓ MongoDB 正在运行${NC}"
else
    echo -e "${RED}✗ MongoDB 未运行${NC}"
    echo -e "${YELLOW}正在启动 MongoDB...${NC}"
    mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data 2>/dev/null || {
        echo -e "${RED}无法启动 MongoDB，请手动启动: mongod${NC}"
        exit 1
    }
    sleep 2
    echo -e "${GREEN}✓ MongoDB 已启动${NC}"
fi

# 检查依赖
echo -e "\n${YELLOW}[2/4] 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    npm install
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
fi

# 构建 shared 包
echo -e "\n${YELLOW}[3/4] 构建共享代码包...${NC}"
cd packages/shared
npm run build > /dev/null 2>&1 || echo -e "${YELLOW}⚠ 构建失败，继续使用 tsx...${NC}"
cd ../..
echo -e "${GREEN}✓ 共享包准备完成${NC}"

# 启动所有服务
echo -e "\n${YELLOW}[4/4] 启动服务...${NC}"

# 创建日志目录
mkdir -p logs

# 清理旧的日志
> logs/api.log
> logs/render.log
> logs/admin.log

# 启动 API 服务
echo -e "${BLUE}启动 API 服务 (端口 3002)...${NC}"
cd packages/api-service
PORT=3002 npx tsx src/index.ts > ../../logs/api.log 2>&1 &
API_PID=$!
cd ../..
echo -e "${GREEN}✓ API 服务已启动 (PID: $API_PID)${NC}"

# 等待 API 服务启动
sleep 3

# 启动渲染服务
echo -e "${BLUE}启动渲染服务 (端口 3001)...${NC}"
cd packages/render-service
PORT=3001 npx tsx src/index.ts > ../../logs/render.log 2>&1 &
RENDER_PID=$!
cd ../..
echo -e "${GREEN}✓ 渲染服务已启动 (PID: $RENDER_PID)${NC}"

# 启动 Admin 服务
echo -e "${BLUE}启动 Admin 服务 (端口 3003)...${NC}"
cd packages/admin-service
PORT=3003 npm run dev > ../../logs/admin.log 2>&1 &
ADMIN_PID=$!
cd ../..
echo -e "${GREEN}✓ Admin 服务已启动 (PID: $ADMIN_PID)${NC}"

# 等待所有服务启动
echo -e "\n${YELLOW}等待所有服务启动...${NC}"
sleep 5

# 检查服务状态
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}  服务状态检查${NC}"
echo -e "${BLUE}=======================================${NC}"

check_service() {
    local url=$1
    local name=$2
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $name 运行正常${NC}"
        return 0
    else
        echo -e "${RED}✗ $name 未响应${NC}"
        return 1
    fi
}

check_service "http://localhost:3002/health" "API 服务 (3002)"
check_service "http://localhost:3001/health" "渲染服务 (3001)"
check_service "http://localhost:3003" "Admin 服务 (3003)"

# 保存 PID 到文件
echo "$API_PID" > .api.pid
echo "$RENDER_PID" > .render.pid
echo "$ADMIN_PID" > .admin.pid

echo -e "\n${BLUE}=======================================${NC}"
echo -e "${GREEN}✓ 所有服务已启动！${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "${YELLOW}访问地址：${NC}"
echo -e "  • 测试页面: ${GREEN}file://$(pwd)/public/index.html${NC}"
echo -e "  • API 文档: ${GREEN}http://localhost:3002/api-docs${NC}"
echo -e "  • 渲染服务: ${GREEN}http://localhost:3001/demo${NC}"
echo -e "  • 管理后台: ${GREEN}http://localhost:3003${NC}"
echo ""
echo -e "${YELLOW}日志文件：${NC}"
echo -e "  • API 服务: logs/api.log"
echo -e "  • 渲染服务: logs/render.log"
echo -e "  • Admin 服务: logs/admin.log"
echo ""
echo -e "${YELLOW}停止所有服务：${NC}"
echo -e "  ${GREEN}./stop-all.sh${NC}"
echo ""
echo -e "${YELLOW}查看日志：${NC}"
echo -e "  ${GREEN}tail -f logs/api.log${NC}"
echo -e "${BLUE}=======================================${NC}"
