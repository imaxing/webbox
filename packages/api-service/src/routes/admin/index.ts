import { Router } from 'express';
import { Response } from '@webbox/shared';
import domainRoutes from '@/routes/admin/domain.routes';
import templateRoutes from '@/routes/admin/template.routes';
import routeRoutes from '@/routes/admin/route.routes';
import userRoutes from '@/routes/admin/user.routes';
import menuRoutes from '@/routes/admin/menu.routes';

const router = Router();

// 健康检查接口
router.get('/health', (req, res) => {
  Response.success(res, {
    timestamp: new Date().toISOString(),
    status: 'running'
  }, '管理后台 API 运行正常');
});

// 注册各模块路由
router.use(domainRoutes);
router.use(templateRoutes);
router.use(routeRoutes);
router.use(userRoutes);
router.use(menuRoutes);

export default router;
