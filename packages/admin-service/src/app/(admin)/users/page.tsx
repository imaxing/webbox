'use client';

import React, { useState, useEffect } from 'react';
import {
  AntTable,
  AntButton,
  Modal,
  type AntTableColumn,
} from '@/components';
import { toast } from '@/lib/toast';
import UserFormDialog from '@/components/UserFormDialog';
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type UserFormData,
} from '@/api/user';

// 角色映射
const ROLE_MAP: Record<string, string> = {
  admin: '管理员',
  editor: '编辑员',
  viewer: '查看员',
};

// 状态映射
const STATUS_MAP: Record<string, string> = {
  active: '激活',
  inactive: '停用',
  suspended: '暂停',
};

export default function UserListPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 表单对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // 加载数据
  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getUserList({
        page,
        limit: pageSize,
      });
      setData(response.data || []);
      setPagination({
        current: page,
        pageSize: response.paging?.per_page || pageSize,
        total: response.paging?.total || 0,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 新增用户
  const handleCreate = () => {
    setEditingUser(undefined);
    setDialogOpen(true);
  };

  // 编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async (formData: UserFormData) => {
    try {
      if (editingUser && editingUser._id) {
        // 编辑
        await updateUser(editingUser._id, formData);
        toast.success('更新成功');
      } else {
        // 新增
        await createUser(formData);
        toast.success('创建成功');
      }
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
      throw error; // 重新抛出错误，让对话框保持打开状态
    }
  };

  // 删除用户
  const handleDelete = async (row: User) => {
    const confirmed = await Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${row.username}" 吗？`,
      type: 'warning',
      onOk: async () => {
        if (!row._id) {
          toast.error('用户 ID 不存在');
          return;
        }
        try {
          await deleteUser(row._id);
          toast.success('删除成功');
          loadData(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error('删除失败:', error);
          toast.error('删除失败');
        }
      },
    });
  };

  // 表格列配置
  const columns: AntTableColumn<User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
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
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === 'admin'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
              : value === 'editor'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {ROLE_MAP[value] || value}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : value === 'suspended'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {STATUS_MAP[value] || value}
        </span>
      ),
    },
    {
      title: '最后登录时间',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      width: 180,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleString('zh-CN') : '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          <AntButton
            size="small"
            type="link"
            onClick={() => handleEdit(record)}
          >
            编辑
          </AntButton>
          <AntButton
            size="small"
            type="link"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </AntButton>
        </div>
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

      {/* 表单对话框 */}
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingUser}
        onSubmit={handleSubmit}
        isEdit={!!editingUser}
      />
    </div>
  );
}
