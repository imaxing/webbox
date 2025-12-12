"use client";

import { ReactNode } from "react";
import { AntTable, AntTableColumn } from "@/components";

export interface Column {
  label: string;
  prop: string;
  width?: number;
  minWidth?: number;
  render?: (row: any) => ReactNode;
  fixed?: "left" | "right";
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  actions?: (row: any) => ReactNode;
  header?: ReactNode;
}

export default function DataTable(props: DataTableProps) {
  const { columns, data, loading, pagination, actions, header } = props;

  // 转换列定义
  const tableColumns: AntTableColumn[] = columns.map((col) => ({
    title: col.label,
    dataIndex: col.prop,
    key: col.prop,
    width: col.width,
    render: col.render,
  }));

  // 添加操作列
  if (actions) {
    tableColumns.push({
      title: "操作",
      key: "actions",
      width: 400,
      render: (_value: any, record: any) => (
        <div className="flex items-center gap-3">{actions(record)}</div>
      ),
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      {header && (
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          {header}
        </div>
      )}

      {/* Table */}
      <AntTable
        columns={tableColumns}
        dataSource={data}
        loading={loading}
        rowKey={(record) => record._id || record.id}
        pagination={
          pagination
            ? {
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: pagination.onChange,
              }
            : false
        }
      />
    </div>
  );
}
