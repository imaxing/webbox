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
import CustomTemplateFormDialog from '@/components/CustomTemplateFormDialog';
import {
  getBaseTemplateList,
  getCustomTemplateList,
  createBaseTemplate,
  updateBaseTemplate,
  deleteBaseTemplate,
  createCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
  type BaseTemplate,
  type BaseTemplateFormData,
  type CustomTemplate,
  type CustomTemplateFormData,
} from '@/api/template';

// Tab 类型
type TabType = 'base' | 'custom';

// 模板分类映射
const CATEGORY_MAP: Record<string, string> = {
  policy: '隐私政策',
  terms: '服务条款',
  safety: '安全政策',
  other: '其他',
};

// 自定义模板状态映射
const CUSTOM_STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  active: '生效',
  archived: '归档',
};

export default function TemplateManagementPage() {
  // Tab 状态
  const [activeTab, setActiveTab] = useState<TabType>('base');

  // 基础模板状态
  const [baseData, setBaseData] = useState<BaseTemplate[]>([]);
  const [baseLoading, setBaseLoading] = useState(false);
  const [basePagination, setBasePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [baseDialogOpen, setBaseDialogOpen] = useState(false);
  const [editingBaseTemplate, setEditingBaseTemplate] = useState<BaseTemplate | undefined>(undefined);

  // 自定义模板状态
  const [customData, setCustomData] = useState<CustomTemplate[]>([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] = useState<CustomTemplate | undefined>(
    undefined
  );

  // 加载基础模板数据
  const loadBaseData = async (page = 1, pageSize = 10) => {
    setBaseLoading(true);
    try {
      const response = await getBaseTemplateList({
        page,
        limit: pageSize,
      });
      setBaseData(response.data || []);
      setBasePagination({
        current: page,
        pageSize: response.paging?.per_page || pageSize,
        total: response.paging?.total || 0,
      });
    } catch (error) {
      console.error('加载基础模板数据失败:', error);
      toast.error('加载基础模板数据失败');
    } finally {
      setBaseLoading(false);
    }
  };

  // 加载自定义模板数据
  const loadCustomData = async (page = 1, pageSize = 10) => {
    setCustomLoading(true);
    try {
      const response = await getCustomTemplateList({
        page,
        limit: pageSize,
      });
      setCustomData(response.data || []);
      setCustomPagination({
        current: page,
        pageSize: response.paging?.per_page || pageSize,
        total: response.paging?.total || 0,
      });
    } catch (error) {
      console.error('加载自定义模板数据失败:', error);
      toast.error('加载自定义模板数据失败');
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'base') {
      loadBaseData();
    } else {
      loadCustomData();
    }
  }, [activeTab]);

  // ==================== 基础模板操作 ====================

  // 新增基础模板
  const handleCreateBase = () => {
    setEditingBaseTemplate(undefined);
    setBaseDialogOpen(true);
  };

  // 编辑基础模板
  const handleEditBase = (template: BaseTemplate) => {
    setEditingBaseTemplate(template);
    setBaseDialogOpen(true);
  };

  // 提交基础模板表单
  const handleBaseSubmit = async (formData: BaseTemplateFormData) => {
    try {
      if (editingBaseTemplate && editingBaseTemplate._id) {
        // 编辑
        await updateBaseTemplate(editingBaseTemplate._id, formData);
        toast.success('更新成功');
      } else {
        // 新增
        await createBaseTemplate(formData);
        toast.success('创建成功');
      }
      loadBaseData(basePagination.current, basePagination.pageSize);
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
      throw error;
    }
  };

  // HTML预览（基础模板）
  const handleBasePreview = (row: BaseTemplate) => {
    const content = row.content || '<p>暂无内容</p>';
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    } else {
      toast.error('无法打开预览窗口，请检查浏览器弹窗拦截设置');
    }
  };

  // 删除基础模板
  const handleDeleteBase = async (row: BaseTemplate) => {
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
          loadBaseData(basePagination.current, basePagination.pageSize);
        } catch (error) {
          console.error('删除失败:', error);
          toast.error('删除失败');
        }
      },
    });
  };

  // ==================== 自定义模板操作 ====================

  // 新增自定义模板
  const handleCreateCustom = () => {
    setEditingCustomTemplate(undefined);
    setCustomDialogOpen(true);
  };

  // 编辑自定义模板
  const handleEditCustom = (template: CustomTemplate) => {
    setEditingCustomTemplate(template);
    setCustomDialogOpen(true);
  };

  // 提交自定义模板表单
  const handleCustomSubmit = async (formData: CustomTemplateFormData) => {
    try {
      if (editingCustomTemplate && editingCustomTemplate._id) {
        // 编辑
        await updateCustomTemplate(editingCustomTemplate._id, formData);
        toast.success('更新成功');
      } else {
        // 新增
        await createCustomTemplate(formData);
        toast.success('创建成功');
      }
      loadCustomData(customPagination.current, customPagination.pageSize);
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
      throw error;
    }
  };

  // HTML预览（自定义模板）
  const handleCustomPreview = (row: CustomTemplate) => {
    const content = row.content || '<p>暂无内容</p>';
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    } else {
      toast.error('无法打开预览窗口，请检查浏览器弹窗拦截设置');
    }
  };

  // 删除自定义模板
  const handleDeleteCustom = async (row: CustomTemplate) => {
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
          loadCustomData(customPagination.current, customPagination.pageSize);
        } catch (error) {
          console.error('删除失败:', error);
          toast.error('删除失败');
        }
      },
    });
  };

  // 基础模板表格列配置
  const baseColumns: AntTableColumn<BaseTemplate>[] = [
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
            onClick={() => handleBasePreview(record)}
          >
            预览
          </AntButton>
          <AntButton
            size="small"
            type="link"
            onClick={() => handleEditBase(record)}
          >
            编辑
          </AntButton>
          <AntButton
            size="small"
            type="link"
            danger
            onClick={() => handleDeleteBase(record)}
          >
            删除
          </AntButton>
        </div>
      ),
    },
  ];

  // 自定义模板表格列配置
  const customColumns: AntTableColumn<CustomTemplate>[] = [
    {
      title: '模板名称',
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
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      width: 200,
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value || '-'}
        </span>
      ),
    },
    {
      title: '基础模板',
      dataIndex: 'base_template_id',
      key: 'base_template_id',
      width: 150,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || '-'}
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
              : value === 'draft'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {CUSTOM_STATUS_MAP[value] || value}
        </span>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          v{value || 1}
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
            onClick={() => handleCustomPreview(record)}
          >
            预览
          </AntButton>
          <AntButton
            size="small"
            type="link"
            onClick={() => handleEditCustom(record)}
          >
            编辑
          </AntButton>
          <AntButton
            size="small"
            type="link"
            danger
            onClick={() => handleDeleteCustom(record)}
          >
            删除
          </AntButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 头部标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">模板管理</h1>
        <AntButton
          type="primary"
          onClick={activeTab === 'base' ? handleCreateBase : handleCreateCustom}
        >
          {activeTab === 'base' ? '新增基础模板' : '新增自定义模板'}
        </AntButton>
      </div>

      {/* Tab 切换按钮 */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('base')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'base'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          基础模板
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'custom'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          自定义模板
        </button>
      </div>

      {/* 表格内容 */}
      {activeTab === 'base' ? (
        <AntTable
          columns={baseColumns}
          dataSource={baseData}
          rowKey="_id"
          loading={baseLoading}
          pagination={{
            ...basePagination,
            onChange: (page, pageSize) => {
              loadBaseData(page, pageSize);
            },
          }}
        />
      ) : (
        <AntTable
          columns={customColumns}
          dataSource={customData}
          rowKey="_id"
          loading={customLoading}
          pagination={{
            ...customPagination,
            onChange: (page, pageSize) => {
              loadCustomData(page, pageSize);
            },
          }}
        />
      )}

      {/* 表单对话框 */}
      <BaseTemplateFormDialog
        open={baseDialogOpen}
        onOpenChange={setBaseDialogOpen}
        initialData={editingBaseTemplate}
        onSubmit={handleBaseSubmit}
        isEdit={!!editingBaseTemplate}
      />

      <CustomTemplateFormDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        initialData={editingCustomTemplate}
        onSubmit={handleCustomSubmit}
        isEdit={!!editingCustomTemplate}
      />
    </div>
  );
}
