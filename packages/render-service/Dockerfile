FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制 package.json
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/render-service/package.json ./packages/render-service/

# 安装依赖
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建共享包
WORKDIR /app/packages/shared
RUN npm run build

# 构建渲染服务
WORKDIR /app/packages/render-service
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 复制必要文件
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/render-service/dist ./packages/render-service/dist
COPY --from=builder /app/packages/render-service/package.json ./packages/render-service/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["node", "packages/render-service/dist/index.js"]
