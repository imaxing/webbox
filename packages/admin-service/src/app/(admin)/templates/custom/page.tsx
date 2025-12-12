'use client';

import React, { useState, useEffect } from 'react';
import {
  AntTable,
  AntButton,
  Modal,
  type AntTableColumn,
} from '@/components';
import { toast } from '@/lib/toast';
import CustomTemplateFormDialog from '@/components/CustomTemplateFormDialog';
import {
  getCustomTemplateList,
  createCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
  type CustomTemplate,
  type CustomTemplateFormData,
} from '@/api/template';

// 状态映射
const STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  active: '生效',
  archived: '归档',
};

export default function CustomTemplateListPage() {
  const [data, setData] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>(undefined);

  // 加载数据
  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getCustomTemplateList({
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
      console.error('加载自定义模板数据失败:', error);
      toast.error('加载自定义模板数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 新增自定义模板
  const handleCreate = () => {
    setEditingTemplate(undefined);
    setDialogOpen(true);
  };

  // 编辑自定义模板
  const handleEdit = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async (formData: CustomTemplateFormData) => {
    try {
      if (editingTemplate && editingTemplate._id) {
        await updateCustomTemplate(editingTemplate._id, formData);
        toast.success('更新成功');
      } else {
        await createCustomTemplate(formData);
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
  const handlePreview = (row: CustomTemplate) => {
    let content = row.content || '<p>暂无内容</p>';

    console.log('[预览] 原始数据:', { content: content.substring(0, 200), variables: row.variables });

    // 替换变量为实际配置的值
    if (row.variables) {
      try {
        const vars = typeof row.variables === 'string'
          ? JSON.parse(row.variables)
          : row.variables;

        console.log('[预览] 解析后的变量:', vars);

        if (vars && typeof vars === 'object' && Object.keys(vars).length > 0) {
          Object.entries(vars).forEach(([name, value]) => {
            const actualValue = String(value || '');
            // 支持两种格式：{{变量名}} 和 {变量名}
            const placeholder1 = `{{${name}}}`;
            const placeholder2 = `{${name}}`;
            console.log(`[预览] 替换: ${placeholder1} 或 ${placeholder2} -> ${actualValue}`);
            content = content.split(placeholder1).join(actualValue);
            content = content.split(placeholder2).join(actualValue);
          });
        }
      } catch (error) {
        console.error('[预览] 变量解析失败:', error);
      }
    }

    console.log('[预览] 最终内容:', content.substring(0, 200));

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    } else {
      toast.error('无法打开预览窗口，请检查浏览器弹窗拦截设置');
    }
  };

  // 删除自定义模板
  const handleDelete = async (row: CustomTemplate) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该自定义模板吗？',
      type: 'warning',
      onOk: async () => {
        if (!row._id) {
          toast.error('模板 ID 不存在');
          return;
        }
        try {
          await deleteCustomTemplate(row._id);
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
  const columns: AntTableColumn<CustomTemplate>[] = [
    {
      title: '模板标识',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
      width: 180,
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      width: 200,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      title: '基础模板',
      dataIndex: 'base_template_id',
      key: 'base_template_id',
      width: 180,
      render: (value) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      title: '变量数量',
      dataIndex: 'variables',
      key: 'variables',
      width: 100,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? Object.keys(value).length : 0}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value) => {
        let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        if (value === 'active') {
          colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        } else if (value === 'draft') {
          colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        } else if (value === 'archived') {
          colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        }

        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
            {STATUS_MAP[value] || value}
          </span>
        );
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">v{value || 1}</span>
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
        <h1 className="text-2xl font-bold">自定义模板</h1>
        <AntButton type="primary" onClick={handleCreate}>
          新增自定义模板
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

      <CustomTemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingTemplate}
        onSubmit={handleSubmit}
        isEdit={!!editingTemplate}
      />
    </div>
  );
}
