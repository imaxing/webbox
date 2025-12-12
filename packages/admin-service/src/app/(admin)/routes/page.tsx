'use client';

import React, { useState, useEffect } from 'react';
import {
  AntTable,
  AntButton,
  Modal,
  type AntTableColumn,
} from '@/components';
import { toast } from '@/lib/toast';
import RouteFormDialog from '@/components/RouteFormDialog';
import {
  getRouteList,
  createRoute,
  updateRoute,
  deleteRoute,
  type RouteRule,
  type RouteFormData,
} from '@/api/route';

// 路由匹配类型映射
const ROUTE_TYPE_MAP: Record<string, string> = {
  exact: '精确匹配',
  wildcard: '通配符',
  regex: '正则表达式',
};

export default function RouteManagementPage() {
  const [data, setData] = useState<RouteRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 表单对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRule | undefined>(undefined);

  // 加载数据
  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getRouteList({
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

  // 新增路由规则
  const handleCreate = () => {
    setEditingRoute(undefined);
    setDialogOpen(true);
  };

  // 编辑路由规则
  const handleEdit = (route: RouteRule) => {
    setEditingRoute(route);
    setDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async (formData: RouteFormData) => {
    try {
      if (editingRoute && editingRoute._id) {
        // 编辑
        await updateRoute(editingRoute._id, formData);
        toast.success('更新成功');
      } else {
        // 新增
        await createRoute(formData);
        toast.success('创建成功');
      }
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
      throw error; // 重新抛出错误，让对话框保持打开状态
    }
  };

  // 启用/禁用切换
  const handleToggle = async (row: RouteRule) => {
    if (!row._id) {
      toast.error('路由规则 ID 不存在');
      return;
    }

    try {
      await updateRoute(row._id, { enabled: !row.enabled });
      toast.success(`已${row.enabled ? '禁用' : '启用'}`);
      loadData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('切换状态失败:', error);
      toast.error('操作失败');
    }
  };

  // 删除路由规则
  const handleDelete = async (row: RouteRule) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该路由规则吗？',
      type: 'warning',
      onOk: async () => {
        if (!row._id) {
          toast.error('路由规则 ID 不存在');
          return;
        }
        try {
          await deleteRoute(row._id);
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
  const columns: AntTableColumn<RouteRule>[] = [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      width: 280,
      render: (value) => (
        <span className="font-mono text-xs text-gray-600">{value || '-'}</span>
      ),
    },
    {
      title: '路由模式',
      dataIndex: 'pattern',
      key: 'pattern',
      width: 220,
      render: (value) => (
        <span className="font-mono font-medium text-sm">{value}</span>
      ),
    },
    {
      title: '匹配类型',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {ROUTE_TYPE_MAP[value] || value}
        </span>
      ),
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      width: 150,
      render: (value) => (
        <span className="font-mono text-sm text-gray-700">{value}</span>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (value) => {
        const priority = value || 0;
        const bgColor =
          priority > 50
            ? 'bg-red-100 text-red-800'
            : priority > 20
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800';
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}
          >
            {priority}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
            onClick={() => handleToggle(record)}
          >
            {record.enabled ? '禁用' : '启用'}
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
        <h1 className="text-2xl font-bold">路由管理</h1>
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
          ...pagination,
          onChange: (page, pageSize) => {
            loadData(page, pageSize);
          },
        }}
      />

      {/* 表单对话框 */}
      <RouteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingRoute}
        onSubmit={handleSubmit}
        isEdit={!!editingRoute}
      />
    </div>
  );
}
