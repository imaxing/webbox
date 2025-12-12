import { Router } from 'express';
import { Domain, CustomTemplate, RouteRule, CrudController, Response, ResponseMessage } from '@webbox/shared';
import { authMiddleware } from '@/middleware/auth';

const router = Router();
const domainCtrl = new CrudController(Domain);

// 域名选项（用于下拉框）
router.get('/domains/options', authMiddleware, async (req, res) => {
  try {
    const domains = await Domain.find({ status: 'active' })
      .select('_id domain app_name project_group')
      .lean();

    const options = domains.map(d => ({
      value: d.domain,
      label: `${d.domain} (${d.app_name})`,
      id: d._id,
      project_group: d.project_group
    }));

    Response.success(res, options);
  } catch (error: any) {
    Response.internalError(res, error.message);
  }
});

// 域名关联信息（模板、路由、统计）
router.get('/domains/:id/relations', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findById(id).lean();

    if (!domain) {
      return Response.notFound(res, ResponseMessage.DOMAIN.NOT_FOUND);
    }

    // 从域名的 routes 字段中提取路由和模板 ID
    const routeIds = (domain.routes || []).map(r => r.route);
    const templateIds = (domain.routes || []).map(r => r.template);

    // 批量查询路由和模板详情
    const [routes, templates] = await Promise.all([
      RouteRule.find({ _id: { $in: routeIds } }).lean(),
      CustomTemplate.find({ _id: { $in: templateIds } }).lean()
    ]);

    Response.success(res, {
      domain,
      templates,
      routes,
      statistics: {
        total_templates: templates.length,
        active_templates: templates.filter(t => t.status === 'active').length,
        total_routes: routes.length,
        enabled_routes: routes.filter(r => r.enabled).length
      }
    });
  } catch (error: any) {
    Response.internalError(res, error.message);
  }
});

// 域名 CRUD 操作
router.get('/domains', authMiddleware, (req, res) => domainCtrl.list(req, res));
router.get('/domains/:id', authMiddleware, (req, res) => domainCtrl.getById(req, res));
router.post('/domains', authMiddleware, (req, res) => domainCtrl.create(req, res));
router.put('/domains/:id', authMiddleware, (req, res) => domainCtrl.update(req, res));
router.delete('/domains/:id', authMiddleware, (req, res) => domainCtrl.delete(req, res));
router.post('/domains/batch-delete', authMiddleware, (req, res) => domainCtrl.batchDelete(req, res));

export default router;
