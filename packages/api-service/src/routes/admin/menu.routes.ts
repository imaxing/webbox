import { Router } from 'express';
import { Response } from '@webbox/shared';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

/**
 * 获取菜单配置
 * GET /admin/menus
 * 返回admin前端的导航菜单结构
 */
router.get('/menus', authMiddleware, async (req, res) => {
  try {
    // 可以根据用户角色返回不同的菜单
    // const user = req.user; // 从认证中间件获取用户信息

    const menuConfig = {
      main: [
        {
          name: 'Dashboard',
          icon: 'GridIcon',
          path: '/'
        },
        {
          name: 'Web工具',
          icon: 'PlugInIcon',
          subItems: [
            {
              name: '路由管理',
              path: '/route-management'
            },
            {
              name: '模板管理',
              path: '/template-management'
            },
            {
              name: '域名管理',
              path: '/domain-management'
            },
            {
              name: '自定义模板',
              path: '/custom-template'
            }
          ]
        },
        {
          name: '用户管理',
          icon: 'UserCircleIcon',
          subItems: [
            {
              name: '用户列表',
              path: '/user-list'
            }
          ]
        }
      ],
      others: []
    };

    Response.success(res, menuConfig, '获取菜单成功');
  } catch (error: any) {
    console.error('获取菜单失败:', error);
    Response.internalError(res, '获取菜单失败');
  }
});

export default router;
