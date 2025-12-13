import mongoose, { Schema, Document } from "mongoose";
import { addDateTimeTransform } from "../utils/datetime";
import { addUUIDField } from "../utils/uuid";

function normalize_domain(input: unknown): string {
  if (typeof input !== "string") return "";
  let value = input.trim();
  value = value.replace(/^https?:\/\//i, "");
  value = value.replace(/\/+$/, "");
  return value;
}

/**
 * 路由-模板映射接口
 */
export interface IRouteTemplateMapping {
  route: mongoose.Types.ObjectId; // 路由规则 ID
  template: mongoose.Types.ObjectId; // 模板 ID
}

/**
 * 域名配置文档接口
 * 存储域名级别的全局配置（应用名称、联系邮箱等）
 */
export interface IDomain extends Document {
  uuid: string;
  domain: string; // 域名基础信息（不含协议）
  app_name: string; // 应用名称
  email: string; // 联系邮箱
  project_group: string; // 项目组
  status: "active" | "inactive"; // 状态
  routes: IRouteTemplateMapping[]; // 路由-模板映射数组
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 域名配置 Schema
 */
const domainSchema: Schema = new Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: normalize_domain,
      index: true,
    },
    app_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    project_group: {
      type: String,
      trim: true,
      index: true,
      default: "default",
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    routes: {
      type: [
        {
          route: {
            type: Schema.Types.ObjectId,
            ref: "RouteRule",
            required: true,
          },
          template: {
            type: Schema.Types.ObjectId,
            ref: "CustomTemplate",
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "domains",
  }
);

// 添加 UUID 字段
addUUIDField(domainSchema);

// 添加时间格式化
addDateTimeTransform(domainSchema);

export const Domain = mongoose.model<IDomain>("Domain", domainSchema);
