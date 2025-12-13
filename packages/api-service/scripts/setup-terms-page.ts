/**
 * 快速设置脚本：创建 /terms 页面所需的数据
 *
 * 用法：
 * npm run setup:terms
 */

import { db, Domain, BaseTemplate, CustomTemplate, RouteRule } from '@webbox/shared';

async function setupTermsPage() {
  try {
    console.log('🚀 开始设置 /terms 页面...\n');

    // 1. 连接数据库
    await db.connect();
    console.log('✓ 数据库连接成功\n');

    // 2. 检查/创建域名
    const domainName = 'joymeet.com';
    let domain = await Domain.findOne({ domain: domainName });

    if (!domain) {
      domain = await Domain.create({
        domain: domainName,
        app_name: 'JoyMeet',
        email: 'support@joymeet.com',
        status: 'active',
        uuid: `domain-${Date.now()}`
      });
      console.log(`✓ 创建域名: ${domainName}`);
    } else {
      console.log(`✓ 域名已存在: ${domainName}`);
    }

    // 3. 创建服务条款模板内容
    const templateContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>服务条款 - {app_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    h2 {
      font-size: 24px;
      margin: 30px 0 15px;
      color: #1a1a1a;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    .highlight {
      background: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>服务条款</h1>
    <div class="subtitle">
      生效日期：{year}-01-01 | 联系邮箱：{email}
    </div>

    <h2>1. 服务说明</h2>
    <p>
      欢迎使用 {app_name}！本服务条款适用于您访问和使用本网站（{domain}）提供的所有服务。
      请仔细阅读以下条款，使用本服务即表示您同意接受这些条款的约束。
    </p>

    <h2>2. 用户责任</h2>
    <p>
      用户在使用本服务时，应遵守中华人民共和国相关法律法规，不得利用本服务从事违法违规活动。
      用户对其账户下的所有活动负责，应妥善保管账户信息。
    </p>

    <div class="highlight">
      <strong>重要提示：</strong>本服务仅供合法用途使用，禁止用于任何违法、侵权或不当行为。
    </div>

    <h2>3. 知识产权</h2>
    <p>
      本网站的所有内容，包括但不限于文字、图片、图形、音频、视频等，均受著作权、商标权及其他知识产权法律保护。
      未经授权，不得擅自使用、复制或传播。
    </p>

    <h2>4. 免责声明</h2>
    <p>
      本服务按"现状"提供，不对服务的及时性、安全性、准确性做出任何保证。
      在法律允许的范围内，{app_name} 对因使用或无法使用本服务而导致的任何损失不承担责任。
    </p>

    <h2>5. 条款变更</h2>
    <p>
      我们保留随时修改本服务条款的权利。修改后的条款将在本页面公布，继续使用本服务即视为接受修改后的条款。
    </p>

    <h2>6. 联系我们</h2>
    <p>
      如对本服务条款有任何疑问或建议，请通过以下方式联系我们：<br>
      邮箱：{email}<br>
      网站：{domain}
    </p>

    <div class="footer">
      © {year} {app_name}. 保留所有权利。
    </div>
  </div>
</body>
</html>`;

    // 4. 创建基础模板
    let baseTemplate = await BaseTemplate.findOne({ name: '服务条款' });

    if (!baseTemplate) {
      baseTemplate = await BaseTemplate.create({
        name: '服务条款',
        category: 'terms',
        content: templateContent,
        variables: [
          { name: 'app_name', type: 'text', required: true, description: '应用名称' },
          { name: 'email', type: 'email', required: true, description: '联系邮箱' },
          { name: 'domain', type: 'text', required: true, description: '域名' },
        ],
        description: '标准服务条款模板'
      });
      console.log(`✓ 创建基础模板: 服务条款 (ID: ${baseTemplate._id})`);
    } else {
      console.log(`✓ 基础模板已存在: 服务条款 (ID: ${baseTemplate._id})`);
    }

    // 5. 创建自定义模板
    let template = await CustomTemplate.findOne({ name: '服务条款-JoyMeet' });

    if (!template) {
      template = await CustomTemplate.create({
        name: '服务条款-JoyMeet',
        base_template_id: baseTemplate._id,
        content: templateContent,
        variables: {
          app_name: 'JoyMeet',
          email: 'support@joymeet.com',
        },
        status: 'active',
        version: 1
      });
      console.log(`✓ 创建自定义模板: 服务条款-JoyMeet (ID: ${template._id})`);
    } else {
      console.log(`✓ 自定义模板已存在: 服务条款-JoyMeet (ID: ${template._id})`);
    }

    // 6. 创建路由规则
    let route = await RouteRule.findOne({
      domain: domainName,
      pattern: '/terms'
    });

    if (!route) {
      route = await RouteRule.create({
        uuid: `route-${Date.now()}`,
        domain: domainName,
        pattern: '/terms',
        type: 'exact',
        template_id: template._id,
        priority: 10,
        enabled: true,
        description: '服务条款页面'
      });
      console.log(`✓ 创建路由规则: /terms -> 服务条款模板`);
    } else {
      console.log(`✓ 路由规则已存在: /terms`);
    }

    console.log('\n🎉 设置完成！现在可以访问 http://localhost:3001/terms\n');

    // 7. 清除缓存
    console.log('📝 建议执行以下命令清除缓存：');
    console.log('curl -X POST http://localhost:3001/clear-cache -H "Content-Type: application/json" -d \'{"domain":"joymeet.com"}\'');

  } catch (error) {
    console.error('❌ 设置失败:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

setupTermsPage();
