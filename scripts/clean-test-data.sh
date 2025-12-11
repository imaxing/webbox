#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3002"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🗑️  清理所有测试数据${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 登录获取 token
echo -e "${YELLOW}1️⃣  登录获取 Token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ 登录失败${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}"
echo ""

# 2. 删除所有测试相关的 Routes
echo -e "${YELLOW}2️⃣  清理所有测试 Routes...${NC}"
ROUTES_RESPONSE=$(curl -s "${BASE_URL}/api/admin/routes" \
  -H "Authorization: Bearer $TOKEN")

ROUTE_IDS=$(echo "$ROUTES_RESPONSE" | grep -o '"_id":"[^"]*"' | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -n "$ROUTE_IDS" ]; then
  COUNT=0
  while IFS= read -r ROUTE_ID; do
    curl -s -X DELETE "${BASE_URL}/api/admin/routes/${ROUTE_ID}" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    COUNT=$((COUNT + 1))
  done <<< "$ROUTE_IDS"
  echo -e "${GREEN}✓ 删除了 $COUNT 个 Routes${NC}"
else
  echo -e "   没有找到 Routes"
fi
echo ""

# 3. 删除所有 Custom Templates
echo -e "${YELLOW}3️⃣  清理所有 Custom Templates...${NC}"
CTEMPLATES_RESPONSE=$(curl -s "${BASE_URL}/api/admin/custom-templates" \
  -H "Authorization: Bearer $TOKEN")

CTEMPLATE_IDS=$(echo "$CTEMPLATES_RESPONSE" | grep -o '"_id":"[^"]*"' | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -n "$CTEMPLATE_IDS" ]; then
  COUNT=0
  while IFS= read -r TEMPLATE_ID; do
    curl -s -X DELETE "${BASE_URL}/api/admin/custom-templates/${TEMPLATE_ID}" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    COUNT=$((COUNT + 1))
  done <<< "$CTEMPLATE_IDS"
  echo -e "${GREEN}✓ 删除了 $COUNT 个 Custom Templates${NC}"
else
  echo -e "   没有找到 Custom Templates"
fi
echo ""

# 4. 删除所有 Base Templates
echo -e "${YELLOW}4️⃣  清理所有 Base Templates...${NC}"
BTEMPLATES_RESPONSE=$(curl -s "${BASE_URL}/api/admin/base-templates" \
  -H "Authorization: Bearer $TOKEN")

BTEMPLATE_IDS=$(echo "$BTEMPLATES_RESPONSE" | grep -o '"_id":"[^"]*"' | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -n "$BTEMPLATE_IDS" ]; then
  COUNT=0
  while IFS= read -r TEMPLATE_ID; do
    curl -s -X DELETE "${BASE_URL}/api/admin/base-templates/${TEMPLATE_ID}" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    COUNT=$((COUNT + 1))
  done <<< "$BTEMPLATE_IDS"
  echo -e "${GREEN}✓ 删除了 $COUNT 个 Base Templates${NC}"
else
  echo -e "   没有找到 Base Templates"
fi
echo ""

# 5. 删除所有域名
echo -e "${YELLOW}5️⃣  清理所有 Domains...${NC}"
DOMAINS_RESPONSE=$(curl -s "${BASE_URL}/api/admin/domains" \
  -H "Authorization: Bearer $TOKEN")

DOMAIN_IDS=$(echo "$DOMAINS_RESPONSE" | grep -o '"_id":"[^"]*"' | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -n "$DOMAIN_IDS" ]; then
  COUNT=0
  while IFS= read -r DOMAIN_ID; do
    curl -s -X DELETE "${BASE_URL}/api/admin/domains/${DOMAIN_ID}" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    COUNT=$((COUNT + 1))
  done <<< "$DOMAIN_IDS"
  echo -e "${GREEN}✓ 删除了 $COUNT 个 Domains${NC}"
else
  echo -e "   没有找到 Domains"
fi
echo ""

# 6. 清理缓存
echo -e "${YELLOW}6️⃣  清理缓存...${NC}"
curl -s -X POST "${BASE_URL}/clear-cache" \
  -H "Content-Type: application/json" \
  -d '{}' > /dev/null
echo -e "${GREEN}✓ 缓存已清理${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 所有测试数据清理完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
