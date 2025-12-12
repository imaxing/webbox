/**
 * PM2 进程配置文件
 * 提供进程守护、自动重启、日志管理等功能
 *
 * 使用方法：
 * - 启动所有服务: pm2 start ecosystem.config.js
 * - 停止所有服务: pm2 stop ecosystem.config.js
 * - 重启所有服务: pm2 restart ecosystem.config.js
 * - 查看服务状态: pm2 status
 * - 查看日志: pm2 logs
 * - 查看某个服务日志: pm2 logs api-service
 */

module.exports = {
  apps: [
    {
      name: 'api-service',
      cwd: './packages/api-service',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      // 自动重启配置
      autorestart: true,
      max_restarts: 10, // 最多重启10次
      min_uptime: '10s', // 至少运行10秒才算启动成功
      max_memory_restart: '500M', // 内存超过500M自动重启
      // 错误后重启
      restart_delay: 3000, // 重启延迟3秒
      exp_backoff_restart_delay: 100, // 指数退避重启
      // 日志配置
      error_file: './logs/pm2-api-error.log',
      out_file: './logs/pm2-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      // 监听文件变化（开发模式可选）
      watch: false,
      // 忽略监听的文件
      ignore_watch: ['node_modules', 'logs', '.next'],
    },
    {
      name: 'render-service',
      cwd: './packages/render-service',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      error_file: './logs/pm2-render-error.log',
      out_file: './logs/pm2-render-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
    },
    {
      name: 'admin-service',
      cwd: './packages/admin-service',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '800M', // Admin服务可能占用更多内存
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      error_file: './logs/pm2-admin-error.log',
      out_file: './logs/pm2-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
    },
  ],
};
