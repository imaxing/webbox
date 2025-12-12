import { Router } from "express";
import { User, Response } from "@webbox/shared";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

/**
 * 获取当前用户信息
 */
router.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return Response.unauthorized(res);
    }

    // 从数据库获取完整的用户信息
    const user = await User.findById(req.user.userId);

    if (!user) {
      return Response.notFound(res, "用户不存在");
    }

    // 检查用户状态
    if (user.status !== "active") {
      return Response.userInactive(res, user.status);
    }

    Response.success(res, user.toSafeObject());
  } catch (error: any) {
    console.error("获取当前用户信息失败:", error);
    Response.internalError(res, error.message);
  }
});

export default router;
