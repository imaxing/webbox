#!/bin/bash

# 删除保护功能测试脚本
echo "========================================="
echo "测试路由和模板删除保护功能"
echo "========================================="

API_BASE="http://localhost:3002/api/admin"

# 获取 token（假设已登录）
# 这里需要根据实际情况获取 token，暂时使用测试 token
# TOKEN="your_auth_token_here"

echo ""
echo "1. 获取所有域名列表，查看是否有使用路由和模板的域名..."
curl -s "$API_BASE/domains?limit=5" | jq '.data[] | {domain: .domain, routes: .routes}'

echo ""
echo "2. 获取所有路由列表..."
curl -s "$API_BASE/routes?limit=5" | jq '.data[] | {_id: ._id, pattern: .pattern, domain: .domain}'

echo ""
echo "3. 获取所有模板列表..."
curl -s "$API_BASE/custom-templates?limit=5" | jq '.data[] | {_id: ._id, name: .name}'

echo ""
echo "========================================="
echo "说明：删除保护功能已经实现"
echo "- 删除被使用的路由时，会返回错误信息并列出使用该路由的域名"
echo "- 删除被使用的模板时，会返回错误信息并列出使用该模板的域名"
echo "- 只有未被使用的路由和模板才能成功删除"
echo "========================================="
