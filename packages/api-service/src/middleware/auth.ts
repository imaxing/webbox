import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env, Response as ResponseUtil } from '@webbox/shared';

// 扩展 Request 类型，添加 user 属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: string;
      };
    }
  }
}

/**
 * JWT 认证中间件
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res);
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀

    // 验证 token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    // 将用户信息附加到请求对象
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return ResponseUtil.tokenInvalid(res);
    }
    return ResponseUtil.unauthorized(res);
  }
};
