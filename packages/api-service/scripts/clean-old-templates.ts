/**
 * 清理旧的模板数据脚本
 *
 * 功能：删除所有 name 字段为英文标识符格式的旧模板数据
 * 判断标准：name 字段不包含中文字符的记录
 *
 * 运行方式：
 * npx tsx scripts/clean-old-templates.ts [--dry-run] [--verbose]
 *
 * 参数：
 * --dry-run: 只显示将要删除的数据，不实际删除
 * --verbose: 显示详细的删除记录
 */

import mongoose from 'mongoose';
import { BaseTemplate, CustomTemplate } from '@webbox/shared';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// 判断字符串是否包含中文字符
function hasChineseCharacters(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str);
}

async function cleanOldTemplates() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webbox';
    console.log(`[清理脚本] 连接数据库: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[清理脚本] 数据库连接成功\n');

    // ========== 清理基础模板 ==========
    console.log('========== 开始清理基础模板 ==========');

    // 查找所有基础模板
    const allBaseTemplates = await BaseTemplate.find().lean();
    console.log(`[基础模板] 总数: ${allBaseTemplates.length}`);

    // 筛选出脏数据（name 不包含中文）
    const dirtyBaseTemplates = allBaseTemplates.filter(t => !hasChineseCharacters(t.name));
    console.log(`[基础模板] 脏数据: ${dirtyBaseTemplates.length}\n`);

    if (dirtyBaseTemplates.length > 0) {
      if (isVerbose) {
        console.log('[基础模板] 将要删除的记录:');
        dirtyBaseTemplates.forEach((t, index) => {
          console.log(`  ${index + 1}. ID: ${t._id}, Name: "${t.name}", Category: ${t.category}`);
        });
        console.log('');
      }

      if (isDryRun) {
        console.log(`[基础模板] [DRY-RUN] 将删除 ${dirtyBaseTemplates.length} 条记录（实际未删除）\n`);
      } else {
        const baseIds = dirtyBaseTemplates.map(t => t._id);
        const baseResult = await BaseTemplate.deleteMany({ _id: { $in: baseIds } });
        console.log(`[基础模板] ✅ 已删除 ${baseResult.deletedCount} 条记录\n`);
      }
    } else {
      console.log('[基础模板] ✅ 无需清理\n');
    }

    // ========== 清理自定义模板 ==========
    console.log('========== 开始清理自定义模板 ==========');

    // 查找所有自定义模板
    const allCustomTemplates = await CustomTemplate.find().lean();
    console.log(`[自定义模板] 总数: ${allCustomTemplates.length}`);

    // 筛选出脏数据（name 不包含中文）
    const dirtyCustomTemplates = allCustomTemplates.filter(t => !hasChineseCharacters(t.name));
    console.log(`[自定义模板] 脏数据: ${dirtyCustomTemplates.length}\n`);

    if (dirtyCustomTemplates.length > 0) {
      if (isVerbose) {
        console.log('[自定义模板] 将要删除的记录:');
        dirtyCustomTemplates.forEach((t, index) => {
          console.log(`  ${index + 1}. ID: ${t._id}, Name: "${t.name}", Status: ${t.status}`);
        });
        console.log('');
      }

      if (isDryRun) {
        console.log(`[自定义模板] [DRY-RUN] 将删除 ${dirtyCustomTemplates.length} 条记录（实际未删除）\n`);
      } else {
        const customIds = dirtyCustomTemplates.map(t => t._id);
        const customResult = await CustomTemplate.deleteMany({ _id: { $in: customIds } });
        console.log(`[自定义模板] ✅ 已删除 ${customResult.deletedCount} 条记录\n`);
      }
    } else {
      console.log('[自定义模板] ✅ 无需清理\n');
    }

    // ========== 汇总统计 ==========
    console.log('========== 清理完成 ==========');
    const totalDirty = dirtyBaseTemplates.length + dirtyCustomTemplates.length;
    if (isDryRun) {
      console.log(`[汇总] 共发现 ${totalDirty} 条脏数据（DRY-RUN 模式，未实际删除）`);
    } else {
      console.log(`[汇总] 共清理 ${totalDirty} 条脏数据`);
    }
    console.log(`  - 基础模板: ${dirtyBaseTemplates.length} 条`);
    console.log(`  - 自定义模板: ${dirtyCustomTemplates.length} 条`);

    if (totalDirty === 0) {
      console.log('\n✨ 数据库已经是干净的，无需清理！');
    } else if (!isDryRun) {
      console.log('\n✨ 清理成功！');
    } else {
      console.log('\n💡 提示：移除 --dry-run 参数可实际执行删除操作');
    }

  } catch (error) {
    console.error('\n❌ 清理失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n[清理脚本] 数据库连接已断开');
  }
}

// 执行清理
console.log('==========================================');
console.log('         模板数据清理脚本');
console.log('==========================================\n');

if (isDryRun) {
  console.log('⚠️  运行模式: DRY-RUN (只查看，不删除)\n');
} else {
  console.log('⚠️  运行模式: 实际删除\n');
}

cleanOldTemplates()
  .then(() => {
    console.log('\n程序退出');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n程序异常退出:', error);
    process.exit(1);
  });
