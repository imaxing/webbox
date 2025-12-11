import { Schema } from 'mongoose';

/**
 * 生成纯数字 UUID（18-19 位）
 * 格式：时间戳(13位) + 随机数(5-6位)
 * @returns {string} 纯数字 UUID 字符串 (如: "785054094907724527")
 */
export function generateUUID(): string {
  const timestamp = Date.now(); // 13位时间戳
  const random = Math.floor(Math.random() * 1000000); // 6位随机数
  return `${timestamp}${random.toString().padStart(6, '0')}`;
}

/**
 * 为 Mongoose Schema 添加 UUID 字段和自动生成
 * @param {Schema} schema - Mongoose Schema 对象
 */
export function addUUIDField(schema: Schema): void {
  schema.add({
    uuid: {
      type: String,
      unique: true,
      index: true,
      default: generateUUID,
    },
  });
}
