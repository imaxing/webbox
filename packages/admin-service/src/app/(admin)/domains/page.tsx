'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  AntTable,
  AntButton,
  AntSelect,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Modal,
  type AntTableColumn,
  type AntSelectOption,
} from '@/components';
import { toast } from '@/lib/toast';
import DomainFormDialog from '@/components/DomainFormDialog';
import DomainConfigDialog from '@/components/DomainConfigDialog';
import { Settings } from 'lucide-react';
import {
  getDomainList,
  createDomain,
  updateDomain,
  deleteDomain,
  type Domain,
  type DomainFormData,
} from '@/api/domain';

// 状态映射
const STATUS_MAP: Record<string, string> = {
  active: '生效',
  inactive: '停用',
};

export default function DomainManagementPage() {
  const [data, setData] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectGroup, setSelectedProjectGroup] = useState<string>('all');
  const [projectGroups, setProjectGroups] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 表单对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | undefined>(undefined);

  // 配置对话框状态
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configDomain, setConfigDomain] = useState<Domain | undefined>(undefined);

  // 加载数据
  const loadData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getDomainList({
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
    loadProjectGroups();
  }, []);

  // 加载项目组列表
  const loadProjectGroups = async () => {
    try {
      const response = await fetch('/json/projects.json');
      const data = await response.json();
      const groups = data.projects.map((project: any) => project.value);
      setProjectGroups(groups);
    } catch (error) {
      console.error('加载项目组列表失败:', error);
    }
  };

  // 根据选择的项目组过滤数据
  const filteredData = useMemo(() => {
    if (selectedProjectGroup === 'all') {
      return data;
    }
    return data.filter((item) => item.project_group === selectedProjectGroup);
  }, [data, selectedProjectGroup]);

  // 项目组选项
  const projectOptions: AntSelectOption[] = [
    { label: '全部项目组', value: 'all' },
    ...projectGroups.map((group) => ({
      label: group,
      value: group,
    })),
  ];

  // 新增域名
  const handleCreate = () => {
    setEditingDomain(undefined);
    setDialogOpen(true);
  };

  // 编辑域名
  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setDialogOpen(true);
  };

  // 提交表单
  const handleSubmit = async (formData: DomainFormData) => {
    try {
      if (editingDomain && editingDomain._id) {
        // 编辑
        await updateDomain(editingDomain._id, formData);
        toast.success('更新成功');
      } else {
        // 新增
        await createDomain(formData);
        toast.success('创建成功');
      }
      loadData(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
      throw error; // 重新抛出错误，让对话框保持打开状态
    }
  };

  // 配置关联
  const handleConfig = (domain: Domain) => {
    setConfigDomain(domain);
    setConfigDialogOpen(true);
  };

  // 删除域名
  const handleDelete = async (row: Domain) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该域名配置吗？',
      type: 'warning',
      onOk: async () => {
        if (!row._id) {
          toast.error('域名 ID 不存在');
          return;
        }
        try {
          await deleteDomain(row._id);
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
  const columns: AntTableColumn<Domain>[] = [
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
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      render: (value) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          {value}
        </a>
      ),
    },
    {
      title: '应用名称',
      dataIndex: 'app_name',
      key: 'app_name',
      width: 150,
    },
    {
      title: '项目组',
      dataIndex: 'project_group',
      key: 'project_group',
      width: 120,
      render: (value) => (
        <span className="text-sm text-gray-700">{value || '-'}</span>
      ),
    },
    {
      title: '联系邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (value) => (
        <a
          href={`mailto:${value}`}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          {value}
        </a>
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
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {STATUS_MAP[value || 'inactive'] || value || 'inactive'}
        </span>
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
      width: 260,
      render: (_, record) => (
        <div className="flex gap-2">
          <AntButton
            size="small"
            type="link"
            onClick={() => handleConfig(record)}
            icon={<Settings className="h-3.5 w-3.5" />}
          >
            配置关联
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
        <h1 className="text-2xl font-bold">域名管理</h1>
        <div className="flex items-center gap-3">
          <AntSelect
            value={selectedProjectGroup}
            onChange={(value) => setSelectedProjectGroup(value as string)}
            options={projectOptions}
            className="w-48"
          />
          <AntButton type="primary" onClick={handleCreate}>
            新增域名
          </AntButton>
        </div>
      </div>

      <AntTable
        columns={columns}
        dataSource={filteredData}
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
      <DomainFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingDomain}
        onSubmit={handleSubmit}
        isEdit={!!editingDomain}
      />

      {/* 配置关联对话框 */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-[95vw] w-auto min-w-[800px] p-0 gap-0 overflow-hidden">
          {configDomain && (
            <>
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle>{configDomain.domain} - 配置关联</DialogTitle>
              </DialogHeader>
              <DomainConfigDialog
                domain={configDomain}
                onSuccess={() => {
                  setConfigDialogOpen(false);
                  loadData(pagination.current, pagination.pageSize);
                }}
                onClose={() => setConfigDialogOpen(false)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
