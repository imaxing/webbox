import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { addDateTimeTransform } from '../utils/datetime';
import { addUUIDField } from '../utils/uuid';

/**
 * 用户文档接口
 * 用于后台管理系统的用户认证和权限管理
 */
export interface IUser extends Document {
  uuid: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'banned';
  last_login_at?: Date;
  last_login_ip?: string;
  createdAt: Date;
  updatedAt: Date;

  // 实例方法
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Partial<IUser>;
}

/**
 * 用户 Model 接口（包含静态方法）
 */
export interface IUserModel extends Model<IUser> {
  findByUsernameOrEmail(identifier: string): Promise<IUser | null>;
}

/**
 * 用户 Schema
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 默认查询时不返回密码
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer',
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
      index: true,
    },
    last_login_at: {
      type: Date,
      default: null,
    },
    last_login_ip: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// 添加 UUID 字段
addUUIDField(userSchema);

// 添加时间格式化
addDateTimeTransform(userSchema);

/**
 * 密码加密中间件
 * 在保存前自动加密密码
 */
userSchema.pre('save', async function (next) {
  // 只有密码被修改时才重新加密
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * 实例方法：验证密码
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * 实例方法：获取安全的用户信息（不包含密码）
 */
userSchema.methods.toSafeObject = function (): Partial<IUser> {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * 静态方法：通过用户名或邮箱查找用户
 */
userSchema.statics.findByUsernameOrEmail = function (identifier: string): Promise<IUser | null> {
  return this.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).select('+password'); // 需要返回密码用于验证
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
