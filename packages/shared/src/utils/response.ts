/**
 * 统一响应工具类
 * 提供标准化的 API 响应方法（适配 Express）
 */

import { Response as ExpressResponse } from 'express';
import { ResponseCode, ResponseMessage } from '../constants/response';

export class Response {
  // 成功响应 (200 OK)
  static success(res: ExpressResponse, data: any = {}, message: string = ResponseMessage.SUCCESS, code: number = ResponseCode.SUCCESS) {
    res.status(200).json({ code, message, data });
  }

  // 创建成功响应 (201 Created)
  static created(res: ExpressResponse, data: any = {}, message: string = ResponseMessage.CREATED_SUCCESS) {
    res.status(201).json({ code: ResponseCode.SUCCESS, message, data });
  }

  // 通用错误响应
  static error(res: ExpressResponse, code: number, message: string, data: any = {}, httpStatus: number = 400) {
    res.status(httpStatus).json({ code, message, data });
  }

  // 400 错误请求
  static badRequest(res: ExpressResponse, message: string = ResponseMessage.BAD_REQUEST, data: any = {}) {
    this.error(res, ResponseCode.BAD_REQUEST, message, data, 400);
  }

  // 401 未认证
  static unauthorized(res: ExpressResponse, message: string = ResponseMessage.AUTH.MISSING_TOKEN, data: any = {}) {
    this.error(res, ResponseCode.UNAUTHORIZED, message, data, 401);
  }

  // 403 权限不足
  static forbidden(res: ExpressResponse, message: string = ResponseMessage.AUTH.INSUFFICIENT_PERMISSIONS, data: any = {}) {
    this.error(res, ResponseCode.FORBIDDEN, message, data, 403);
  }

  // 404 资源不存在
  static notFound(res: ExpressResponse, message: string = ResponseMessage.NOT_FOUND, data: any = {}) {
    this.error(res, ResponseCode.NOT_FOUND, message, data, 404);
  }

  // 500 服务器内部错误
  static internalError(res: ExpressResponse, message: string = ResponseMessage.INTERNAL_ERROR, data: any = {}) {
    this.error(res, ResponseCode.INTERNAL_ERROR, message, data, 500);
  }

  // Token 无效或过期 (401)
  static tokenInvalid(res: ExpressResponse, data: any = {}) {
    this.error(res, ResponseCode.TOKEN_INVALID, ResponseMessage.AUTH.TOKEN_INVALID, data, 401);
  }

  // 用户不存在 (401)
  static userNotFound(res: ExpressResponse, data: any = {}) {
    this.error(res, ResponseCode.USER_NOT_FOUND, ResponseMessage.AUTH.USER_NOT_FOUND, data, 401);
  }

  // 用户账号被禁用 (403)
  static userInactive(res: ExpressResponse, status: string) {
    this.error(res, ResponseCode.USER_INACTIVE, ResponseMessage.AUTH.USER_INACTIVE, { status }, 403);
  }

  // 登录失败 (401)
  static loginFailed(res: ExpressResponse) {
    this.error(res, ResponseCode.LOGIN_FAILED, ResponseMessage.AUTH.LOGIN_FAILED, {}, 401);
  }

  // 重复键错误 (400)
  static duplicateKey(res: ExpressResponse, message: string = ResponseMessage.DUPLICATE_KEY) {
    this.error(res, ResponseCode.DUPLICATE_KEY, message, {}, 400);
  }
}
