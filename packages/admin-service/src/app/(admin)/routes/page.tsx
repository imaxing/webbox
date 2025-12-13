"use client";

import React, { useState } from "react";
import {
  AntTable,
  AntButton,
  type AntTableColumn,
  TableActions,
} from "@/components";
import { toast } from "@/lib/toast";
import { createDialog } from "@/lib/dialog.dynamic";
import { RouteForm } from "@/components";
import api from "@/api";
import type { RouteRule, RouteFormData } from "@/api/route";
import { useTableData, useDict } from "@/hooks";

export default function RouteManagementPage() {
  const dicts = useDict();
  const { data, loading, pagination, loadData, refresh } =
    useTableData<RouteRule>({
      fetchData: api.route.list,
      initialPageSize: 20,
    });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 新增路由规则
  const handleCreate = () => {
    const dialog = createDialog({
      title: "新增路由规则",
      width: 650,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
      component: (
        <RouteForm
          isEdit={false}
          onSubmit={async (formData: RouteFormData) => {
            await api.route.create(formData);
            toast.success("创建成功");
            refresh();
          }}
        />
      ),
    });
  };

  // 编辑路由规则
  const handleEdit = (route: RouteRule) => {
    const dialog = createDialog({
      title: "编辑路由规则",
      width: 650,
      component: (
        <RouteForm
          initialData={route}
          isEdit={true}
          onSubmit={async (formData: RouteFormData) => {
            if (route._id) {
              await api.route.update(route._id, formData);
              toast.success("更新成功");
              refresh();
            }
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 启用/禁用切换
  const handleToggle = async (row: RouteRule) => {
    if (!row._id) return;
    await api.route.update(row._id, { enabled: !row.enabled });
    toast.success(`已${row.enabled ? "禁用" : "启用"}`);
    refresh();
  };

  // 删除路由规则
  const handleDelete = async (row: RouteRule) => {
    if (!row._id) return;
    await api.route.delete(row._id);
    toast.success("删除成功");
    refresh();
  };

  // 表格列配置
  const columns: AntTableColumn<RouteRule>[] = [
    {
      title: "UUID",
      dataIndex: "uuid",
      key: "uuid",
      width: 280,
    },
    {
      title: "路由模式",
      dataIndex: "pattern",
      key: "pattern",
      width: 220,
    },
    {
      title: "匹配类型",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {dicts.map.routeType[value] || value}
        </span>
      ),
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 80,
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      width: 80,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "启用" : "禁用"}
        </span>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      width: 80,
      render: (_, record) => (
        <TableActions
          actions={[
            {
              text: "编辑",
              onClick: () => handleEdit(record),
            },
            {
              text: record.enabled ? "禁用" : "启用",
              onClick: () => handleToggle(record),
            },
            {
              text: "删除",
              onClick: () => handleDelete(record),
              danger: true,
              divider: true,
              confirm: `确定要删除路由规则"${record.pattern}"吗？`,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <AntButton type="primary" onClick={handleCreate}>
          新增路由规则
        </AntButton>
      </div>

      <AntTable
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: loadData,
        }}
      />
    </div>
  );
}
