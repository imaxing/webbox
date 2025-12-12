import { Router } from "express";
import {
  RouteRule,
  CrudController,
  Domain,
  Response,
  ResponseMessage,
} from "@webbox/shared";
import { authMiddleware } from "@/middleware/auth";
import mongoose from "mongoose";

const router = Router();
const routeRuleCtrl = new CrudController(RouteRule);

// 路由规则 CRUD 操作
router.get("/routes", authMiddleware, (req, res) =>
  routeRuleCtrl.list(req, res)
);
router.get("/routes/:id", authMiddleware, (req, res) =>
  routeRuleCtrl.getById(req, res)
);
router.post("/routes", authMiddleware, (req, res) =>
  routeRuleCtrl.create(req, res)
);
router.put("/routes/:id", authMiddleware, (req, res) =>
  routeRuleCtrl.update(req, res)
);

// 自定义删除处理器 - 带使用检查
router.delete("/routes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.badRequest(res, "无效的路由 ID");
    }

    // 检查是否被任何域名使用
    const usedByDomains = await Domain.find({
      "routes.route": new mongoose.Types.ObjectId(id),
    })
      .select("domain")
      .lean();

    if (usedByDomains.length > 0) {
      const domainList = usedByDomains.map((d) => d.domain).join(", ");
      return Response.badRequest(
        res,
        `该路由正在被以下域名使用，无法删除：${domainList}`
      );
    }

    // 未被使用，可以删除
    const data = await RouteRule.findByIdAndDelete(id);

    if (!data) {
      return Response.notFound(res);
    }

    Response.success(res, {}, ResponseMessage.DELETED_SUCCESS);
  } catch (error: any) {
    console.error("删除路由失败:", error);
    return Response.internalError(res, error.message);
  }
});

// 自定义批量删除处理器 - 带使用检查
router.post("/routes/batch-delete", authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.badRequest(res, "ids 参数必须是非空数组");
    }

    // 验证所有 ID 格式
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return Response.badRequest(
        res,
        `包含无效的路由 ID: ${invalidIds.join(", ")}`
      );
    }

    // 检查是否有任何路由被域名使用
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const usedByDomains = await Domain.find({
      "routes.route": { $in: objectIds },
    })
      .select("domain routes")
      .lean();

    if (usedByDomains.length > 0) {
      // 找出哪些路由被使用
      const usedRouteIds = new Set<string>();
      usedByDomains.forEach((domain) => {
        domain.routes.forEach((mapping) => {
          const routeId = mapping.route.toString();
          if (ids.includes(routeId)) {
            usedRouteIds.add(routeId);
          }
        });
      });

      const domainList = usedByDomains.map((d) => d.domain).join(", ");
      return Response.badRequest(
        res,
        `有 ${usedRouteIds.size} 个路由正在被以下域名使用，无法删除：${domainList}`
      );
    }

    // 未被使用，可以批量删除
    const result = await RouteRule.deleteMany({ _id: { $in: ids } });

    Response.success(res, {
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("批量删除路由失败:", error);
    return Response.internalError(res, error.message);
  }
});

export default router;
