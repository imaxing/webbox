import { Router } from 'express';
import { BaseTemplate, CustomTemplate, CrudController, Response, ResponseMessage } from '@webbox/shared';
import { authMiddleware } from '@/middleware/auth';

const router = Router();
const baseTemplateCtrl = new CrudController(BaseTemplate);
const customTemplateCtrl = new CrudController(CustomTemplate);

// ==================== 基础模板路由 ====================

// 基础模板选项（用于下拉框）
router.get('/base-templates/options', authMiddleware, async (req, res) => {
  try {
    const templates = await BaseTemplate.find()
      .select('_id name display_name')
      .lean();

    const options = templates.map(t => ({
      value: t._id,
      label: `${t.display_name} (${t.name})`
    }));

    Response.success(res, options);
  } catch (error: any) {
    console.error('Get base template options error:', error);
    Response.internalError(res, error.message);
  }
});

// 基础模板 CRUD 操作
router.get('/base-templates', authMiddleware, (req, res) => baseTemplateCtrl.list(req, res));
router.get('/base-templates/:id', authMiddleware, (req, res) => baseTemplateCtrl.getById(req, res));
router.post('/base-templates', authMiddleware, (req, res) => baseTemplateCtrl.create(req, res));
router.put('/base-templates/:id', authMiddleware, (req, res) => baseTemplateCtrl.update(req, res));
router.delete('/base-templates/:id', authMiddleware, (req, res) => baseTemplateCtrl.delete(req, res));
router.post('/base-templates/batch-delete', authMiddleware, (req, res) => baseTemplateCtrl.batchDelete(req, res));

// ==================== 定制模板路由 ====================

// 定制模板选项（用于下拉框）
router.get('/custom-templates/options', authMiddleware, async (req, res) => {
  try {
    const { domain } = req.query;
    const query = domain ? { domain, status: 'active' } : { status: 'active' };

    const templates = await CustomTemplate.find(query)
      .select('_id name display_name domain')
      .lean();

    const options = templates.map(t => ({
      value: t._id,
      label: `${t.display_name} (${t.name})`,
      domain: t.domain
    }));

    Response.success(res, options);
  } catch (error: any) {
    console.error('Get custom template options error:', error);
    Response.internalError(res, error.message);
  }
});

// 定制模板 CRUD 操作
router.get('/custom-templates', authMiddleware, (req, res) => customTemplateCtrl.list(req, res));
router.get('/custom-templates/:id', authMiddleware, (req, res) => customTemplateCtrl.getById(req, res));
router.post('/custom-templates', authMiddleware, (req, res) => customTemplateCtrl.create(req, res));
router.put('/custom-templates/:id', authMiddleware, (req, res) => customTemplateCtrl.update(req, res));
router.delete('/custom-templates/:id', authMiddleware, (req, res) => customTemplateCtrl.delete(req, res));
router.post('/custom-templates/batch-delete', authMiddleware, (req, res) => customTemplateCtrl.batchDelete(req, res));

// ==================== 模板复制功能 ====================

// 复制模板（基础模板 → 定制模板）
router.post('/templates/copy', authMiddleware, async (req, res) => {
  try {
    const { baseTemplateId, name, domain, variables } = req.body;

    if (!baseTemplateId || !name || !domain) {
      return Response.badRequest(res, '缺少必填字段：基础模板ID、名称、域名');
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
      status: 'draft',
      version: 1
    });

    Response.created(res, customTemplate, ResponseMessage.TEMPLATE.COPIED);
  } catch (error: any) {
    console.error('Copy template error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return Response.badRequest(res, messages.join('; '));
    }
    if (error.name === 'CastError') {
      return Response.badRequest(res, `无效的 ${error.path}：${error.value}`);
    }
    if (error.code === 11000) {
      return Response.duplicateKey(res);
    }
    if (error.message && error.message.includes('not found')) {
      return Response.notFound(res, error.message);
    }

    Response.internalError(res, error.message);
  }
});

export default router;
