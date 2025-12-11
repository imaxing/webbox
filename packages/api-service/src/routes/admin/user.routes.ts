import { Router } from 'express';
import { User, CrudController } from '@webbox/shared';
import { authMiddleware } from '@/middleware/auth';

const router = Router();
const userCtrl = new CrudController(User);

// 用户 CRUD 操作
router.get('/users', authMiddleware, (req, res) => userCtrl.list(req, res));
router.get('/users/:id', authMiddleware, (req, res) => userCtrl.getById(req, res));
router.post('/users', authMiddleware, (req, res) => userCtrl.create(req, res));
router.put('/users/:id', authMiddleware, (req, res) => userCtrl.update(req, res));
router.delete('/users/:id', authMiddleware, (req, res) => userCtrl.delete(req, res));
router.post('/users/batch-delete', authMiddleware, (req, res) => userCtrl.batchDelete(req, res));

export default router;
