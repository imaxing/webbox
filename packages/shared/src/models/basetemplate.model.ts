import mongoose, { Schema, Document } from 'mongoose';
import { addDateTimeTransform } from '../utils/datetime';
import { addUUIDField } from '../utils/uuid';

/**
 * 变量定义接口
 */
export interface IVariable {
  name: string;          // 变量名
  type: 'text' | 'email' | 'url' | 'image';  // 变量类型
  required: boolean;     // 是否必填
  default_value?: string; // 默认值
  description?: string;   // 变量说明
}

/**
 * 公共模板库文档接口
 * 存储可复用的通用模板（如儿童安全政策、隐私政策等）
 */
export interface IBaseTemplate extends Document {
  uuid: string;
  name: string;           // 模板唯一标识
  display_name: string;   // 显示名称
  category: 'policy' | 'terms' | 'safety' | 'other'; // 分类
  content: string;        // HTML 模板内容
  variables: IVariable[]; // 可配置变量列表
  description?: string;   // 模板用途描述
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 公共模板 Schema
 */
const baseTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    display_name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['policy', 'terms', 'safety', 'other'],
      default: 'other',
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    variables: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: ['text', 'email', 'url', 'image'],
          default: 'text',
        },
        required: { type: Boolean, default: false },
        default_value: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    description: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'base_templates',
  }
);

// 复合索引：按分类查询列表时使用
baseTemplateSchema.index({ category: 1, createdAt: -1 });

// 添加 UUID 字段
addUUIDField(baseTemplateSchema);

// 添加时间格式化
addDateTimeTransform(baseTemplateSchema);

export const BaseTemplate = mongoose.model<IBaseTemplate>('BaseTemplate', baseTemplateSchema);
