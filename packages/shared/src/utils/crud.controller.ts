/**
 * 通用 CRUD 控制器
 * 提供标准的增删改查操作（适配 Express）
 */

import { Request, Response as ExpressResponse } from 'express';
import { Model, Document } from 'mongoose';
import { formatDateTime } from './datetime';
import { Response } from './response';
import { ResponseMessage } from '../constants/response';

/**
 * 格式化文档的时间字段
 */
function formatDocumentDates(doc: any) {
  if (!doc) return doc;
  if (doc.createdAt) doc.createdAt = formatDateTime(doc.createdAt);
  if (doc.updatedAt) doc.updatedAt = formatDateTime(doc.updatedAt);
  return doc;
}

/**
 * 统一处理数据库错误
 * 根据错误类型返回正确的 HTTP 状态码
 */
function handleDatabaseError(res: ExpressResponse, error: any, operation: string = 'Operation') {
  console.error(`${operation} error:`, error);

  // Mongoose 验证错误 → 400
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return Response.badRequest(res, messages.join('; '));
  }

  // Mongoose CastError（无效的 ObjectId 等）→ 400
  if (error.name === 'CastError') {
    return Response.badRequest(res, `无效的 ${error.path}：${error.value}`);
  }

  // MongoDB 唯一索引冲突 → 400
  if (error.code === 11000) {
    return Response.duplicateKey(res);
  }

  // 其他错误 → 500
  return Response.internalError(res, error.message);
}

export class CrudController<T extends Document> {
  constructor(private Model: Model<T>) {}

  /**
   * 获取列表（支持分页、搜索、排序）
   */
  async list(req: Request, res: ExpressResponse) {
    try {
      const { page = '1', limit = '20', sort = '-createdAt', ...filters } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // 构建查询条件
      const query: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          const value = filters[key] as string;
          // 布尔值字段直接赋值
          if (value === 'true' || value === 'false') {
            query[key] = value === 'true';
          }
          // 字符串字段支持模糊搜索
          else if (typeof value === 'string') {
            query[key] = new RegExp(value, 'i');
          }
          // 其他类型直接赋值
          else {
            query[key] = value;
          }
        }
      });

      // 执行查询
      const [list, total] = await Promise.all([
        this.Model.find(query).sort(sort as string).skip(skip).limit(limitNum).lean(),
        this.Model.countDocuments(query)
      ]);

      // 格式化时间字段
      const formattedList = list.map(formatDocumentDates);

      const lastPage = Math.ceil(total / limitNum);

      Response.success(res, {
        data: formattedList,
        paging: {
          next_page: pageNum < lastPage ? pageNum + 1 : pageNum,
          total,
          last_page: lastPage,
          per_page: limitNum
        }
      });
    } catch (error) {
      return handleDatabaseError(res, error, 'List');
    }
  }

  /**
   * 获取单条记录
   */
  async getById(req: Request, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const data = await this.Model.findById(id).lean();

      if (!data) {
        return Response.notFound(res);
      }

      Response.success(res, formatDocumentDates(data));
    } catch (error) {
      return handleDatabaseError(res, error, 'GetById');
    }
  }

  /**
   * 创建记录
   */
  async create(req: Request, res: ExpressResponse) {
    try {
      const body = req.body;
      const doc = await this.Model.create(body);
      const data = doc.toObject();

      Response.created(res, formatDocumentDates(data));
    } catch (error) {
      return handleDatabaseError(res, error, 'Create');
    }
  }

  /**
   * 更新记录
   */
  async update(req: Request, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const body = req.body;

      const doc = await this.Model.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      );

      if (!doc) {
        return Response.notFound(res);
      }

      const data = doc.toObject();
      Response.success(res, formatDocumentDates(data), ResponseMessage.UPDATED_SUCCESS);
    } catch (error) {
      return handleDatabaseError(res, error, 'Update');
    }
  }

  /**
   * 删除记录
   */
  async delete(req: Request, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const data = await this.Model.findByIdAndDelete(id);

      if (!data) {
        return Response.notFound(res);
      }

      Response.success(res, {}, ResponseMessage.DELETED_SUCCESS);
    } catch (error) {
      return handleDatabaseError(res, error, 'Delete');
    }
  }

  /**
   * 批量删除
   */
  async batchDelete(req: Request, res: ExpressResponse) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return Response.badRequest(res, 'ids 参数必须是非空数组');
      }

      const result = await this.Model.deleteMany({ _id: { $in: ids } });

      Response.success(res, {
        deletedCount: result.deletedCount
      });
    } catch (error) {
      return handleDatabaseError(res, error, 'BatchDelete');
    }
  }
}
