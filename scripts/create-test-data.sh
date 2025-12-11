#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3002"

# 从 .env 文件读取 DEV_HOST（脚本从项目根目录执行）
if [ -f ".env" ]; then
  export $(grep "^DEV_HOST=" .env | xargs)
fi
DEV_HOST="${DEV_HOST:-blaze.com}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 创建测试数据${NC}"
echo -e "${BLUE}  使用域名: ${DEV_HOST}${NC}"
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
echo -e "   Token: ${TOKEN:0:20}..."
echo ""

# 2. 创建 Domain
echo -e "${YELLOW}2️⃣  创建 Domain...${NC}"
DOMAIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/domains" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"domain\": \"${DEV_HOST}\",
    \"app_name\": \"测试应用\",
    \"email\": \"test@example.com\",
    \"project_group\": \"test\",
    \"status\": \"active\"
  }")

DOMAIN_ID=$(echo "$DOMAIN_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -z "$DOMAIN_ID" ]; then
  echo -e "${RED}❌ Domain 创建失败${NC}"
  echo "$DOMAIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Domain 创建成功${NC}"
echo -e "   ID: $DOMAIN_ID"
echo -e "   Host: ${DEV_HOST}"
echo ""

# 3. 创建 Base Template（使用时间戳避免重复）
echo -e "${YELLOW}3️⃣  创建 Base Template...${NC}"
TIMESTAMP=$(date +%s)
BASE_TEMPLATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/base-templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试基础模板_'"${TIMESTAMP}"'",
    "display_name": "测试基础模板",
    "content": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>{page_title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:50px auto;padding:20px;background:#f5f7fa}h1{color:#4CAF50;border-bottom:3px solid #4CAF50;padding-bottom:10px}.info{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin:20px 0}.label{color:#666;font-weight:bold;display:inline-block;width:120px}</style></head><body><h1>🎉 {page_title}</h1><div class=\"info\"><p><span class=\"label\">用户名:</span> {username}</p><p><span class=\"label\">邮箱:</span> {email}</p><p><span class=\"label\">域名:</span> {domain}</p><p><span class=\"label\">路径:</span> {path}</p><p><span class=\"label\">描述:</span> {description}</p><p><span class=\"label\">时间戳:</span> {timestamp}</p></div><div class=\"info\"><h3>✅ 模板变量测试成功</h3><p>这是一个测试页面，用于验证 Webbox 的路由和模板系统。</p><ul><li>域名配置: ✓</li><li>路由规则: ✓</li><li>模板渲染: ✓</li><li>变量替换: ✓</li></ul></div></body></html>",
    "description": "自动创建的测试基础模板",
    "category": "other",
    "variables": [
      {"name": "page_title", "type": "text", "required": false, "default_value": "", "description": "页面标题"},
      {"name": "username", "type": "text", "required": false, "default_value": "", "description": "用户名"},
      {"name": "email", "type": "email", "required": false, "default_value": "", "description": "邮箱"},
      {"name": "description", "type": "text", "required": false, "default_value": "", "description": "描述"}
    ]
  }')

BASE_TEMPLATE_ID=$(echo "$BASE_TEMPLATE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -z "$BASE_TEMPLATE_ID" ]; then
  echo -e "${RED}❌ Base Template 创建失败${NC}"
  echo "$BASE_TEMPLATE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Base Template 创建成功${NC}"
echo -e "   ID: $BASE_TEMPLATE_ID"
echo ""

# 4. 创建 Custom Template
echo -e "${YELLOW}4️⃣  创建 Custom Template...${NC}"
TEMPLATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/custom-templates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"测试定制模板\",
    \"display_name\": \"测试定制模板\",
    \"base_template_id\": \"${BASE_TEMPLATE_ID}\",
    \"domain\": \"${DEV_HOST}\",
    \"content\": \"<!DOCTYPE html><html><head><meta charset=\\\"UTF-8\\\"><title>{page_title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:50px auto;padding:20px;background:#f5f7fa}h1{color:#4CAF50;border-bottom:3px solid #4CAF50;padding-bottom:10px}.info{background:white;padding:20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin:20px 0}.label{color:#666;font-weight:bold;display:inline-block;width:120px}</style></head><body><h1>🎉 {page_title}</h1><div class=\\\"info\\\"><p><span class=\\\"label\\\">用户名:</span> {username}</p><p><span class=\\\"label\\\">邮箱:</span> {email}</p><p><span class=\\\"label\\\">域名:</span> {domain}</p><p><span class=\\\"label\\\">路径:</span> {path}</p><p><span class=\\\"label\\\">描述:</span> {description}</p><p><span class=\\\"label\\\">时间戳:</span> {timestamp}</p></div><div class=\\\"info\\\"><h3>✅ 模板变量测试成功</h3><p>这是一个测试页面，用于验证 Webbox 的路由和模板系统。</p><ul><li>域名配置: ✓</li><li>路由规则: ✓</li><li>模板渲染: ✓</li><li>变量替换: ✓</li></ul></div></body></html>\",
    \"variables\": {
      \"page_title\": \"Webbox 测试页面\",
      \"username\": \"张三\",
      \"email\": \"zhangsan@example.com\",
      \"description\": \"这是一个自动生成的测试页面\"
    },
    \"status\": \"active\"
  }")

TEMPLATE_ID=$(echo "$TEMPLATE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -z "$TEMPLATE_ID" ]; then
  echo -e "${RED}❌ Template 创建失败${NC}"
  echo "$TEMPLATE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Template 创建成功${NC}"
echo -e "   ID: $TEMPLATE_ID"
echo ""

# 5. 创建 Route
echo -e "${YELLOW}5️⃣  创建 Route...${NC}"
ROUTE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/routes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"domain\": \"${DEV_HOST}\",
    \"pattern\": \"/test\",
    \"type\": \"exact\",
    \"template_id\": \"${TEMPLATE_ID}\",
    \"description\": \"测试路由 - 精确匹配 /test\",
    \"priority\": 100,
    \"enabled\": true
  }")

ROUTE_ID=$(echo "$ROUTE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -z "$ROUTE_ID" ]; then
  echo -e "${RED}❌ Route 创建失败${NC}"
  echo "$ROUTE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Route 创建成功${NC}"
echo -e "   ID: $ROUTE_ID"
echo ""

# 6. 创建通配符路由
echo -e "${YELLOW}6️⃣  创建通配符 Route...${NC}"
WILDCARD_ROUTE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/admin/routes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"domain\": \"${DEV_HOST}\",
    \"pattern\": \"/test/*\",
    \"type\": \"wildcard\",
    \"template_id\": \"${TEMPLATE_ID}\",
    \"description\": \"测试路由 - 通配符匹配 /test/*\",
    \"priority\": 90,
    \"enabled\": true
  }")

WILDCARD_ROUTE_ID=$(echo "$WILDCARD_ROUTE_RESPONSE" | grep -o '"_id":"[^"]*"' | head -1 | sed 's/"_id":"\([^"]*\)"/\1/')

if [ -z "$WILDCARD_ROUTE_ID" ]; then
  echo -e "${RED}❌ 通配符 Route 创建失败${NC}"
  echo "$WILDCARD_ROUTE_RESPONSE"
else
  echo -e "${GREEN}✓ 通配符 Route 创建成功${NC}"
  echo -e "   ID: $WILDCARD_ROUTE_ID"
  echo ""
fi

# 7. 输出测试地址
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 所有测试数据创建完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📍 测试地址 (请在 Render Service 访问):${NC}"
echo ""
echo -e "   ${GREEN}Render Service:${NC} http://localhost:3001"
echo ""
echo -e "   ${BLUE}1. 精确匹配测试:${NC}"
echo -e "      👉 ${GREEN}http://localhost:3001/test${NC}"
echo ""
echo -e "   ${BLUE}2. 通配符匹配测试:${NC}"
echo -e "      👉 ${GREEN}http://localhost:3001/test/page1${NC}"
echo -e "      👉 ${GREEN}http://localhost:3001/test/page2${NC}"
echo -e "      👉 ${GREEN}http://localhost:3001/test/anything${NC}"
echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   • 确保 Render Service 正在运行 (端口 3001)"
echo -e "   • 确保 .env 中设置了 DEV_HOST=${DEV_HOST}"
echo -e "   • 页面将显示模板变量的实际值"
echo ""
echo -e "${YELLOW}📊 创建的资源 ID:${NC}"
echo -e "   Domain:          $DOMAIN_ID"
echo -e "   Base Template:   $BASE_TEMPLATE_ID"
echo -e "   Custom Template: $TEMPLATE_ID"
echo -e "   Route 1:         $ROUTE_ID"
echo -e "   Route 2:         $WILDCARD_ROUTE_ID"
echo ""
