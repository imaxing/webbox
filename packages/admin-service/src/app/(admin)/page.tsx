import DomainMetrics from '@/components/DomainMetrics';
import DomainRelationGraph from '@/components/DomainRelationGraph';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* 总体指标卡片 */}
      <DomainMetrics />

      {/* 域名关系图 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          域名关系图
        </h2>
        <DomainRelationGraph />
      </div>
    </div>
  );
}
