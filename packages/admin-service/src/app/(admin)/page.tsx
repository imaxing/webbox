import { DomainMetrics, DomainRelationGraph } from "@/components";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* 总体指标卡片 */}
      <DomainMetrics />

      {/* 域名关系图 */}
      <DomainRelationGraph />
    </div>
  );
}
