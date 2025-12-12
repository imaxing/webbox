import { Router } from "express";
import {
  BaseTemplate,
  CustomTemplate,
  CrudController,
  Domain,
  Response,
  ResponseMessage,
} from "@webbox/shared";
import { authMiddleware } from "@/middleware/auth";
import mongoose from "mongoose";

const router = Router();
const baseTemplateCtrl = new CrudController(BaseTemplate);
const customTemplateCtrl = new CrudController(CustomTemplate);

// ==================== 基础模板路由 ====================

// 基础模板选项（用于下拉框）
router.get("/base-templates/options", authMiddleware, async (req, res) => {
  try {
    const templates = await BaseTemplate.find()
      .select("_id name display_name")
      .lean();

    const options = templates.map((t) => ({
      value: t._id,
      label: `${t.display_name} (${t.name})`,
    }));

    Response.success(res, options);
  } catch (error: any) {
    console.error("获取基础模板选项失败:", error);
    Response.internalError(res, error.message);
  }
});

// 基础模板 CRUD 操作
router.get("/base-templates", authMiddleware, (req, res) =>
  baseTemplateCtrl.list(req, res)
);
router.get("/base-templates/:id", authMiddleware, (req, res) =>
  baseTemplateCtrl.getById(req, res)
);
router.post("/base-templates", authMiddleware, (req, res) =>
  baseTemplateCtrl.create(req, res)
);
router.put("/base-templates/:id", authMiddleware, (req, res) =>
  baseTemplateCtrl.update(req, res)
);
router.delete("/base-templates/:id", authMiddleware, (req, res) =>
  baseTemplateCtrl.delete(req, res)
);
router.post("/base-templates/batch-delete", authMiddleware, (req, res) =>
  baseTemplateCtrl.batchDelete(req, res)
);

// ==================== 定制模板路由 ====================

// 定制模板选项（用于下拉框）
router.get("/custom-templates/options", authMiddleware, async (req, res) => {
  try {
    const { domain } = req.query;
    const query = domain ? { domain, status: "active" } : { status: "active" };

    const templates = await CustomTemplate.find(query)
      .select("_id name display_name domain")
      .lean();

    const options = templates.map((t) => ({
      value: t._id,
      label: `${t.display_name} (${t.name})`,
      domain: t.domain,
    }));

    Response.success(res, options);
  } catch (error: any) {
    console.error("获取定制模板选项失败:", error);
    Response.internalError(res, error.message);
  }
});

// 定制模板 CRUD 操作
router.get("/custom-templates", authMiddleware, (req, res) =>
  customTemplateCtrl.list(req, res)
);
router.get("/custom-templates/:id", authMiddleware, (req, res) =>
  customTemplateCtrl.getById(req, res)
);
router.post("/custom-templates", authMiddleware, (req, res) =>
  customTemplateCtrl.create(req, res)
);
router.put("/custom-templates/:id", authMiddleware, (req, res) =>
  customTemplateCtrl.update(req, res)
);

// 自定义删除处理器 - 带使用检查
router.delete("/custom-templates/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.badRequest(res, "无效的模板 ID");
    }

    // 检查是否被任何域名使用
    const usedByDomains = await Domain.find({
      "routes.template": new mongoose.Types.ObjectId(id),
    })
      .select("domain")
      .lean();

    if (usedByDomains.length > 0) {
      const domainList = usedByDomains.map((d) => d.domain).join(", ");
      return Response.badRequest(
        res,
        `该模板正在被以下域名使用，无法删除：${domainList}`
      );
    }

    // 未被使用，可以删除
    const data = await CustomTemplate.findByIdAndDelete(id);

    if (!data) {
      return Response.notFound(res);
    }

    Response.success(res, {}, ResponseMessage.DELETED_SUCCESS);
  } catch (error: any) {
    console.error("删除定制模板失败:", error);
    return Response.internalError(res, error.message);
  }
});

// 自定义批量删除处理器 - 带使用检查
router.post(
  "/custom-templates/batch-delete",
  authMiddleware,
  async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return Response.badRequest(res, "ids 参数必须是非空数组");
      }

      // 验证所有 ID 格式
      const invalidIds = ids.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        return Response.badRequest(
          res,
          `包含无效的模板 ID: ${invalidIds.join(", ")}`
        );
      }

      // 检查是否有任何模板被域名使用
      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      const usedByDomains = await Domain.find({
        "routes.template": { $in: objectIds },
      })
        .select("domain routes")
        .lean();

      if (usedByDomains.length > 0) {
        // 找出哪些模板被使用
        const usedTemplateIds = new Set<string>();
        usedByDomains.forEach((domain) => {
          domain.routes.forEach((mapping) => {
            const templateId = mapping.template.toString();
            if (ids.includes(templateId)) {
              usedTemplateIds.add(templateId);
            }
          });
        });

        const domainList = usedByDomains.map((d) => d.domain).join(", ");
        return Response.badRequest(
          res,
          `有 ${usedTemplateIds.size} 个模板正在被以下域名使用，无法删除：${domainList}`
        );
      }

      // 未被使用，可以批量删除
      const result = await CustomTemplate.deleteMany({ _id: { $in: ids } });

      Response.success(res, {
        deletedCount: result.deletedCount,
      });
    } catch (error: any) {
      console.error("批量删除定制模板失败:", error);
      return Response.internalError(res, error.message);
    }
  }
);

// ==================== 模板复制功能 ====================

// 复制模板（基础模板 → 定制模板）
router.post("/templates/copy", authMiddleware, async (req, res) => {
  try {
    const { baseTemplateId, name, domain, variables } = req.body;

    if (!baseTemplateId || !name || !domain) {
      return Response.badRequest(res, "缺少必填字段：基础模板ID、名称、域名");
    }

    // 查找基础模板
    const baseTemplate = await BaseTemplate.findById(baseTemplateId).lean();
    if (!baseTemplate) {
      return Response.notFound(res, `基础模板未找到: ${baseTemplateId}`);
    }

    // 创建定制模板
    const customTemplate = await CustomTemplate.create({
      name,
      display_name: baseTemplate.display_name,
      base_template_id: baseTemplate._id,
      domain,
      content: baseTemplate.content,
      variables: new Map(Object.entries(variables || {})),
      status: "draft",
      version: 1,
    });

    Response.created(res, customTemplate, ResponseMessage.TEMPLATE.COPIED);
  } catch (error: any) {
    console.error("复制模板失败:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return Response.badRequest(res, messages.join("; "));
    }
    if (error.name === "CastError") {
      return Response.badRequest(res, `无效的 ${error.path}：${error.value}`);
    }
    if (error.code === 11000) {
      return Response.duplicateKey(res);
    }
    if (error.message && error.message.includes("not found")) {
      return Response.notFound(res, error.message);
    }

    Response.internalError(res, error.message);
  }
});

export default router;
