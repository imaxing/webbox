"use client";

import React, { useState } from "react";
import {
  AntTable,
  AntButton,
  type AntTableColumn,
  TableActions,
  EnumBadge,
} from "@/components";
import { toast } from "@/lib/toast";
import { createDialog } from "@/lib/dialog.dynamic";
import { UserForm } from "@/components";
import api from "@/api";
import type { User, UserFormData } from "@/api/user";
import { useTableData, useDict } from "@/hooks";
import { RefreshCw } from "lucide-react";

export default function UserListPage() {
  const dicts = useDict();
  const { data, loading, pagination, loadData, refresh } = useTableData<User>({
    fetchData: api.user.list,
    initialPageSize: 20,
  });

  // 新增用户
  const handleCreate = () => {
    createDialog({
      title: "新增用户",
      width: 600,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
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
    });
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    createDialog({
      title: "编辑用户",
      width: 600,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
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
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (value) => {
        return (
          <EnumBadge
            value={value}
            items={{
              admin: {
                text: dicts.map.userRole.admin || "admin",
                variant: "purple",
              },
              editor: {
                text: dicts.map.userRole.editor || "editor",
                variant: "blue",
              },
              viewer: {
                text: dicts.map.userRole.viewer || "viewer",
                variant: "gray",
              },
            }}
          />
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => {
        return (
          <EnumBadge
            value={value}
            items={{
              active: {
                text: dicts.map.userStatus.active || "active",
                variant: "success",
              },
              suspended: {
                text: dicts.map.userStatus.suspended || "suspended",
                variant: "warning",
              },
              inactive: {
                text: dicts.map.userStatus.inactive || "inactive",
                variant: "error",
              },
            }}
          />
        );
      },
    },
    {
      title: "最后登录时间",
      dataIndex: "last_login_at",
      key: "last_login_at",
      width: 180,
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
      <div className="flex items-center justify-end gap-3">
        <AntButton icon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
          刷新
        </AntButton>
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
