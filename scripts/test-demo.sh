#!/bin/bash

echo "======================================="
echo "Webbox 服务测试脚本"
echo "======================================="

# 检查 MongoDB
echo -e "\n1. 检查 MongoDB..."
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB 正在运行"
else
    echo "❌ MongoDB 未运行，请先启动 MongoDB"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:7"
    exit 1
fi

# 启动 API 服务
echo -e "\n2. 启动 API 服务 (端口 3002)..."
cd packages/api-service
npx tsx src/index.ts &
API_PID=$!
cd ../..
sleep 5

# 测试 API 健康检查
echo -e "\n3. 测试 API 服务健康检查..."
curl -s http://localhost:3002/health | jq . || echo "❌ API 服务未响应"

# 创建测试用户
echo -e "\n4. 创建测试用户..."
curl -s -X POST http://localhost:3002/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }' | jq . || echo "❌ 创建用户失败"

# 启动渲染服务
echo -e "\n5. 启动渲染服务 (端口 3001)..."
cd packages/render-service
npx tsx src/index.ts &
RENDER_PID=$!
cd ../..
sleep 5

# 测试渲染服务
echo -e "\n6. 测试渲染服务..."
curl -s http://localhost:3001/health | jq . || echo "❌ 渲染服务未响应"

echo -e "\n======================================="
echo "✅ 测试完成！"
echo "======================================="
echo "服务访问地址："
echo "  - API 服务健康检查: http://localhost:3002/health"
echo "  - 渲染服务演示页面: http://localhost:3001/demo"
echo "  - Admin 登录页面: http://localhost:3003"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "======================================="

# 等待用户中断
wait
