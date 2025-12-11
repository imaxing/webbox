import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// 环境变量Schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // MongoDB 配置（支持用户名密码认证）
  // 格式: mongodb://username:password@localhost:27017/database?authSource=admin
  MONGODB_URI: z.string().default('mongodb://localhost:27017/webbox'),

  // JWT 密钥
  JWT_SECRET: z.string().default('your-secret-key-change-in-production'),
});

// 解析并验证环境变量
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
