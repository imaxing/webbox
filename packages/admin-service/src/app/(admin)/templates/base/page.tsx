'use client';

import React, { useState, useEffect } from 'react';
import {
  AntTable,
  AntButton,
  Modal,
  type AntTableColumn,
} from '@/components';
import { toast } from '@/lib/toast';
import BaseTemplateFormDialog from '@/components/BaseTemplateFormDialog';
import {
  getBaseTemplateList,
  createBaseTemplate,
  updateBaseTemplate,
  deleteBaseTemplate,
  type BaseTemplate,
  type BaseTemplateFormData,
} from '@/api/template';

// 模板分类映射
const CATEGORY_MAP: Record<string, string> = {
  policy: '隐私政策',
  terms: '服务条款',
  safety: '安全政策',
  other: '其他',
};

export default function BaseTemplateListPage() {
  const [data, setData] = useState<BaseTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BaseTemplate | undefined>(undefined);

  // 加载数据
  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getBaseTemplateList({
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
      console.error('加载基础模板数据失败:', error);
      toast.error('加载基础模板数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 新增基础模板
  const handleCreate = () => {
    setEditingTemplate(undefined);
    setDialogOpen(true);
  };

  // 编辑基础模板
  const handleEdit = (template: BaseTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async (formData: BaseTemplateFormData) => {
    try {
      if (editingTemplate && editingTemplate._id) {
        await updateBaseTemplate(editingTemplate._id, formData);
        toast.success('更新成功');
      } else {
        await createBaseTemplate(formData);
        toast.success('创建成功');
      }
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
      throw error;
    }
  };

  // HTML预览
  const handlePreview = (row: BaseTemplate) => {
    let content = row.content || '<p>暂无内容</p>';

    // 替换变量为默认值或示例值
    if (row.variables) {
      const vars = Array.isArray(row.variables)
        ? row.variables
        : (typeof row.variables === 'string' ? JSON.parse(row.variables) : []);

      if (vars && vars.length > 0) {
        vars.forEach((variable: any) => {
          const value = variable.default_value || `[示例${variable.name}]`;
          // 支持两种格式：{{变量名}} 和 {变量名}
          const placeholder1 = `{{${variable.name}}}`;
          const placeholder2 = `{${variable.name}}`;
          content = content.split(placeholder1).join(value);
          content = content.split(placeholder2).join(value);
        });
      }
    }

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    } else {
      toast.error('无法打开预览窗口，请检查浏览器弹窗拦截设置');
    }
  };

  // 删除基础模板
  const handleDelete = async (row: BaseTemplate) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该基础模板吗？',
      type: 'warning',
      onOk: async () => {
        if (!row._id) {
          toast.error('模板 ID 不存在');
          return;
        }
        try {
          await deleteBaseTemplate(row._id);
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
  const columns: AntTableColumn<BaseTemplate>[] = [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      width: 280,
      render: (value) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      title: '模板标识',
      dataIndex: 'name',
      key: 'name',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
          {CATEGORY_MAP[value] || value}
        </span>
      ),
    },
    {
      title: '变量数量',
      dataIndex: 'variables',
      key: 'variables',
      width: 100,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? value.length : 0}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || '-'}
        </span>
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
            onClick={() => handlePreview(record)}
          >
            预览
          </AntButton>
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
        <h1 className="text-2xl font-bold">基础模板</h1>
        <AntButton type="primary" onClick={handleCreate}>
          新增基础模板
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

      <BaseTemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingTemplate}
        onSubmit={handleSubmit}
        isEdit={!!editingTemplate}
      />
    </div>
  );
}
