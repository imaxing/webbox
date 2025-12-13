import { Router } from "express";
import type { MenuItem, MenuPayload } from "@webbox/shared";
import { Response } from "@webbox/shared";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

function build_menu_items(role?: string): MenuItem[] {
  // TODO: 后续根据 role 过滤菜单（例如 viewer 隐藏管理入口）
  // 当前保持全量菜单返回
  return [
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
      children: [
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
}

/**
 * 获取菜单配置
 * GET /admin/menus
 * 返回admin前端的导航菜单结构
 */
router.get("/menus", authMiddleware, async (req, res) => {
  try {
    const items = build_menu_items(req.user?.role);
    const payload: MenuPayload = { items };
    Response.success(res, payload, "获取菜单成功");
  } catch (error: any) {
    console.error("获取菜单失败:", error);
    Response.internalError(res, "获取菜单失败");
  }
});

export default router;
