import mongoose, { Schema, Document } from 'mongoose';
import { addDateTimeTransform } from '../utils/datetime';
import { addUUIDField } from '../utils/uuid';

/**
 * 定制模板实例文档接口
 * 基于公共模板创建的定制化实例
 */
export interface ICustomTemplate extends Document {
  uuid: string;
  name: string;           // 模板名称（用于展示和唯一标识）
  base_template_id: mongoose.Types.ObjectId; // 关联的公共模板 ID
  content: string;        // 定制后的 HTML 内容
  variables: Map<string, string>; // 变量值映射
  status: 'draft' | 'active' | 'archived'; // 状态
  version: number;        // 版本号
  created_by: string;     // 创建人
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 定制模板 Schema
 */
const customTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    base_template_id: {
      type: Schema.Types.ObjectId,
      ref: 'BaseTemplate',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    created_by: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
    collection: 'custom_templates',
  }
);

// 复合索引：按状态查询模板（高频查询）
customTemplateSchema.index({ status: 1, updatedAt: -1 });

// 添加 UUID 字段
addUUIDField(customTemplateSchema);

// 添加时间格式化
addDateTimeTransform(customTemplateSchema);

export const CustomTemplate = mongoose.model<ICustomTemplate>('CustomTemplate', customTemplateSchema);
