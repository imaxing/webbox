import { Schema } from 'mongoose';

/**
 * 格式化日期为 YYYY-MM-DD HH:mm:ss
 * @param {Date|string} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 为 Mongoose Schema 添加时间格式化的 toJSON transform
 * @param {Schema} schema - Mongoose Schema 对象
 */
export function addDateTimeTransform(schema: Schema): void {
  schema.set('toJSON', {
    transform: function (doc: any, ret: any) {
      if (ret.createdAt) ret.createdAt = formatDateTime(ret.createdAt);
      if (ret.updatedAt) ret.updatedAt = formatDateTime(ret.updatedAt);
      if (ret.last_login_at) ret.last_login_at = formatDateTime(ret.last_login_at);
      return ret;
    },
  });
}
