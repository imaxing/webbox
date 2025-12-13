import { Router } from "express";
import { Response } from "@webbox/shared";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

/**
 * 获取菜单配置
 * GET /admin/menus
 * 返回admin前端的导航菜单结构
 */
router.get("/menus", authMiddleware, async (req, res) => {
  try {
    // 可以根据用户角色返回不同的菜单
    // const user = req.user; // 从认证中间件获取用户信息

    const menus = [
      {
        name: "首页",
        icon: "Home",
        path: "/",
      },
      {
        name: "用户管理",
        icon: "Users",
        path: "/users",
      },
      {
        name: "域名管理",
        icon: "Globe",
        path: "/domains",
      },
      {
        name: "路由管理",
        icon: "Route",
        path: "/routes",
      },
      {
        name: "模板管理",
        icon: "FileText",
        subItems: [
          {
            name: "基础模板",
            path: "/templates/base",
          },
          {
            name: "自定义模板",
            path: "/templates/custom",
          },
        ],
      },
    ];

    Response.success(res, menus, "获取菜单成功");
  } catch (error: any) {
    console.error("获取菜单失败:", error);
    Response.internalError(res, "获取菜单失败");
  }
});

export default router;
