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
import { UserForm } from "@/components";
import api from "@/api";
import type { User, UserFormData } from "@/api/user";
import { useTableData, useDict } from "@/hooks";

export default function UserListPage() {
  const dicts = useDict();
  const { data, loading, pagination, loadData, refresh } = useTableData<User>({
    fetchData: api.user.list,
    initialPageSize: 20,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 新增用户
  const handleCreate = () => {
    createDialog({
      title: "新增用户",
      width: 600,
      component: (
        <UserForm
          isEdit={false}
          onSubmit={async (formData: UserFormData) => {
            await api.user.create(formData);
            toast.success("创建成功");
            refresh();
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    createDialog({
      title: "编辑用户",
      width: 600,
      component: (
        <UserForm
          initialData={user}
          isEdit={true}
          onSubmit={async (formData: UserFormData) => {
            await api.user.update(user._id, formData);
            toast.success("更新成功");
            refresh();
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 删除用户
  const handleDelete = async (row: User) => {
    await api.user.delete(row._id);
    toast.success("删除成功");
    refresh();
  };

  // 表格列配置
  const columns: AntTableColumn<User>[] = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 150,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (value) => (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-700 hover:underline"
        >
          {value}
        </a>
      ),
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === "admin"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              : value === "editor"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {dicts.map.userRole[value] || value}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : value === "suspended"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {dicts.map.userStatus[value] || value}
        </span>
      ),
    },
    {
      title: "最后登录时间",
      dataIndex: "last_login_at",
      key: "last_login_at",
      width: 180,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleString("zh-CN") : "-"}
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleString("zh-CN") : "-"}
        </span>
      ),
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
              text: "删除",
              onClick: () => handleDelete(record),
              danger: true,
              divider: true,
              confirm: `确定要删除用户"${record.username}"吗？`,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <AntButton type="primary" onClick={handleCreate}>
          新增用户
        </AntButton>
      </div>

      <AntTable
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            loadData(page, pageSize);
          },
        }}
      />
    </div>
  );
}
