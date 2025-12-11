FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制 package.json
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/admin-service/package.json ./packages/admin-service/

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

# 构建 Admin 服务
WORKDIR /app/packages/admin-service
ENV NEXT_PUBLIC_API_URL=http://api-service:3002
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://api-service:3002

# 复制必要文件
COPY --from=builder /app/packages/admin-service/.next ./packages/admin-service/.next
COPY --from=builder /app/packages/admin-service/public ./packages/admin-service/public
COPY --from=builder /app/packages/admin-service/package.json ./packages/admin-service/
COPY --from=builder /app/packages/admin-service/next.config.ts ./packages/admin-service/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3003

WORKDIR /app/packages/admin-service
CMD ["npm", "start"]
