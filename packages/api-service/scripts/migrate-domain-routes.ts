/**
 * 数据迁移脚本：将路由-模板关系迁移到 Domain.routes
 *
 * 迁移逻辑：
 * 1. 从 RouteRule 中提取域名关联（通过旧的 domain 字段）
 * 2. 将路由-模板映射写入 Domain.routes 字段
 * 3. 清除 RouteRule 和 CustomTemplate 的 domain 字段
 */

import mongoose from 'mongoose';
import { Domain, RouteRule, CustomTemplate } from '@webbox/shared';

// 提取域名主机名（去掉协议和端口）
function extractHostname(domainUrl: string): string {
  if (!domainUrl) return '';
  try {
    const url = new URL(domainUrl);
    return url.hostname;
  } catch (error) {
    return domainUrl
      .replace(/^https?:\/\//, '')
      .split(':')[0]
      .split('/')[0];
  }
}

async function migrate() {
  try {
    console.log('🚀 开始数据迁移...\n');

    // 1. 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webbox';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功\n');

    // 2. 查询所有域名
    const domains = await Domain.find({}).lean();
    console.log(`📊 找到 ${domains.length} 个域名\n`);

    let totalMigrated = 0;
    let totalSkipped = 0;

    // 3. 对每个域名进行迁移
    for (const domain of domains) {
      const hostname = extractHostname(domain.domain);
      console.log(`\n处理域名: ${domain.domain} (主机名: ${hostname})`);

      // 3.1 查询该域名下的所有路由（通过旧的 domain 字段）
      const routes = await RouteRule.find({ domain: hostname }).lean();
      console.log(`  找到 ${routes.length} 条路由`);

      if (routes.length === 0) {
        console.log(`  ⏭️  跳过（无路由）`);
        totalSkipped++;
        continue;
      }

      // 3.2 构建 routes 数组
      const routeMappings = routes
        .filter((route: any) => route.template_id) // 只迁移有模板的路由
        .map((route: any) => ({
          route: route._id,
          template: route.template_id,
        }));

      console.log(`  构建了 ${routeMappings.length} 条路由-模板映射`);

      if (routeMappings.length === 0) {
        console.log(`  ⏭️  跳过（无有效映射）`);
        totalSkipped++;
        continue;
      }

      // 3.3 更新 Domain 的 routes 字段
      await Domain.updateOne(
        { _id: domain._id },
        { $set: { routes: routeMappings } }
      );

      console.log(`  ✅ 已更新 Domain.routes`);
      totalMigrated++;
    }

    console.log('\n\n📈 迁移统计:');
    console.log(`  ✅ 成功迁移: ${totalMigrated} 个域名`);
    console.log(`  ⏭️  跳过: ${totalSkipped} 个域名`);

    // 4. 清除路由和模板中的 domain 字段
    console.log('\n🧹 清理旧字段...');

    const routeUpdateResult = await RouteRule.updateMany(
      { domain: { $exists: true } },
      { $unset: { domain: '' } }
    );
    console.log(`  ✅ RouteRule: 清除了 ${routeUpdateResult.modifiedCount} 条记录的 domain 字段`);

    const templateUpdateResult = await CustomTemplate.updateMany(
      { domain: { $exists: true } },
      { $unset: { domain: '' } }
    );
    console.log(`  ✅ CustomTemplate: 清除了 ${templateUpdateResult.modifiedCount} 条记录的 domain 字段`);

    // 5. 删除旧索引
    console.log('\n🔧 更新索引...');
    try {
      await RouteRule.collection.dropIndex('domain_1_pattern_1');
      console.log('  ✅ 删除 RouteRule 旧索引: domain_1_pattern_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('  ℹ️  RouteRule 旧索引不存在，跳过');
      } else {
        console.log('  ⚠️  删除 RouteRule 旧索引失败:', error.message);
      }
    }

    try {
      await CustomTemplate.collection.dropIndex('domain_1_name_1');
      console.log('  ✅ 删除 CustomTemplate 旧索引: domain_1_name_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('  ℹ️  CustomTemplate 旧索引不存在，跳过');
      } else {
        console.log('  ⚠️  删除 CustomTemplate 旧索引失败:', error.message);
      }
    }

    // 6. 创建新索引
    try {
      await RouteRule.collection.createIndex({ pattern: 1 }, { unique: true });
      console.log('  ✅ 创建 RouteRule 新索引: pattern_1 (unique)');
    } catch (error: any) {
      console.log('  ℹ️  RouteRule 新索引已存在');
    }

    try {
      await CustomTemplate.collection.createIndex({ name: 1 }, { unique: true });
      console.log('  ✅ 创建 CustomTemplate 新索引: name_1 (unique)');
    } catch (error: any) {
      console.log('  ℹ️  CustomTemplate 新索引已存在');
    }

    console.log('\n✨ 数据迁移完成！\n');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 执行迁移
migrate();
