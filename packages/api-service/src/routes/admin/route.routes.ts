import { Router } from 'express';
import { RouteRule, CrudController } from '@webbox/shared';
import { authMiddleware } from '@/middleware/auth';

const router = Router();
const routeRuleCtrl = new CrudController(RouteRule);

// 路由规则 CRUD 操作
router.get('/routes', authMiddleware, (req, res) => routeRuleCtrl.list(req, res));
router.get('/routes/:id', authMiddleware, (req, res) => routeRuleCtrl.getById(req, res));
router.post('/routes', authMiddleware, (req, res) => routeRuleCtrl.create(req, res));
router.put('/routes/:id', authMiddleware, (req, res) => routeRuleCtrl.update(req, res));
router.delete('/routes/:id', authMiddleware, (req, res) => routeRuleCtrl.delete(req, res));
router.post('/routes/batch-delete', authMiddleware, (req, res) => routeRuleCtrl.batchDelete(req, res));

export default router;
