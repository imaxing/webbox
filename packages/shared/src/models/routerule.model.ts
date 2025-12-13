import mongoose, { Schema, Document } from 'mongoose';
import { addDateTimeTransform } from '../utils/datetime';
import { addUUIDField } from '../utils/uuid';

/**
 * 路由规则文档接口
 * 路由规则仅描述匹配规则本身
 * ⚠️ 不与域名/模板做反向关联，关联关系由 Domain.routes 统一维护
 */
export interface IRouteRule extends Document {
  uuid: string;
  pattern: string;        // 路由模式（如 "/proto/child-safety-*"）
  type: 'exact' | 'wildcard' | 'regex'; // 匹配类型
  priority: number;       // 优先级（0-100）
  enabled: boolean;       // 是否启用
  description?: string;   // 规则描述
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 路由规则 Schema
 */
const routeRuleSchema: Schema = new Schema(
  {
    pattern: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['exact', 'wildcard', 'regex'],
      default: 'exact',
    },
    priority: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'route_rules',
  }
);

// 复合索引：核心查询（按启用状态+优先级排序）
routeRuleSchema.index({ enabled: 1, priority: -1 });

// 唯一索引：匹配类型+路由模式组合唯一
routeRuleSchema.index({ type: 1, pattern: 1 }, { unique: true });

// 添加 UUID 字段
addUUIDField(routeRuleSchema);

// 添加时间格式化
addDateTimeTransform(routeRuleSchema);

export const RouteRule = mongoose.model<IRouteRule>('RouteRule', routeRuleSchema);
