import { Router } from "express";
import jwt from "jsonwebtoken";
import { User, env, Response } from "@webbox/shared";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

/**
 * 用户登录
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return Response.badRequest(res, "username 和 password 为必填项");
    }

    // 查找用户（需要返回密码字段）
    const user = await User.findByUsernameOrEmail(username);

    if (!user) {
      return Response.loginFailed(res);
    }

    // 检查用户状态
    if (user.status !== "active") {
      return Response.userInactive(res, user.status);
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return Response.loginFailed(res);
    }

    // 更新最后登录时间和 IP
    user.last_login_at = new Date();
    user.last_login_ip = req.ip || req.socket.remoteAddress || "";
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    Response.success(res, {
      token,
      user: user.toSafeObject(),
    });
  } catch (error: any) {
    console.error("登录失败:", error);
    Response.internalError(res, error.message);
  }
});

/**
 * 获取当前用户信息
 */
router.get("/me", authMiddleware, async (req, res) => {
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

/**
 * 创建用户（仅用于初始化）
 */
router.post("/users", async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      return Response.badRequest(res, "username, password, email 为必填项");
    }

    const user = new User({
      username,
      password, // 会在 pre-save hook 中自动加密
      email,
      role: role || "viewer",
      status: "active",
    });

    await user.save();

    Response.created(res, user.toSafeObject());
  } catch (error: any) {
    console.error("创建用户失败:", error);

    if (error.code === 11000) {
      return Response.duplicateKey(res, "用户名或邮箱已存在");
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return Response.badRequest(res, messages.join("; "));
    }

    Response.internalError(res, error.message);
  }
});

export default router;
