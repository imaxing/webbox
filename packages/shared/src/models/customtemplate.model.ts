import mongoose, { Schema, Document } from 'mongoose';
import { addDateTimeTransform } from '../utils/datetime';
import { addUUIDField } from '../utils/uuid';

/**
 * 定制模板实例文档接口
 * 基于公共模板创建的定制化实例，绑定到特定域名
 */
export interface ICustomTemplate extends Document {
  uuid: string;
  name: string;           // 定制模板名称
  display_name: string;   // 显示名称
  base_template_id: mongoose.Types.ObjectId; // 关联的公共模板 ID
  domain: string;         // 所属域名
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
      index: true,
    },
    display_name: {
      type: String,
      required: true,
      trim: true,
    },
    base_template_id: {
      type: Schema.Types.ObjectId,
      ref: 'BaseTemplate',
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
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

// 复合索引：按域名查询生效模板（高频查询）
customTemplateSchema.index({ domain: 1, status: 1, updatedAt: -1 });

// 唯一索引：同一域名下模板名称唯一
customTemplateSchema.index({ domain: 1, name: 1 }, { unique: true });

// 添加 UUID 字段
addUUIDField(customTemplateSchema);

// 添加时间格式化
addDateTimeTransform(customTemplateSchema);

export const CustomTemplate = mongoose.model<ICustomTemplate>('CustomTemplate', customTemplateSchema);
