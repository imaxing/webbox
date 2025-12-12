"use client";

import React, { useState, useEffect } from "react";
import { AntTable, AntButton, Modal, type AntTableColumn } from "@/components";
import { TableActions } from "@/components";
import { toast } from "@/lib/toast";
import { createDialog } from "@/lib/dialog.dynamic";
import { BaseTemplateForm, CustomTemplateForm } from "@/components";
import api from "@/api";
import type {
  BaseTemplate,
  CustomTemplate,
  BaseTemplateFormData,
  CustomTemplateFormData,
} from "@/api/template";
import { useTableData, usePreview, useDict } from "@/hooks";

// Tab 类型
type TabType = "base" | "custom";

export default function TemplateManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("base");
  const dicts = useDict();

  // 基础模板数据
  const {
    data: baseData,
    loading: baseLoading,
    pagination: basePagination,
    loadData: loadBaseData,
    refresh: refreshBase,
  } = useTableData<BaseTemplate>({
    fetchData: api.template.base.list,
    initialPageSize: 20,
  });

  // 自定义模板数据
  const {
    data: customData,
    loading: customLoading,
    pagination: customPagination,
    loadData: loadCustomData,
    refresh: refreshCustom,
  } = useTableData<CustomTemplate>({
    fetchData: api.template.custom.list,
    initialPageSize: 20,
  });

  const preview = usePreview();

  useEffect(() => {
    if (activeTab === "base") {
      refreshBase();
    } else {
      refreshCustom();
    }
  }, [activeTab]);

  // ==================== 基础模板操作 ====================

  // 新增基础模板
  const handleCreateBase = () => {
    createDialog({
      title: "新增基础模板",
      width: 750,
      component: (
        <BaseTemplateForm
          isEdit={false}
          onSubmit={async (formData: BaseTemplateFormData) => {
            await api.template.base.create(formData);
            toast.success("创建成功");
            refreshBase();
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 编辑基础模板
  const handleEditBase = (template: BaseTemplate) => {
    createDialog({
      title: "编辑基础模板",
      width: 750,
      component: (
        <BaseTemplateForm
          initialData={template}
          isEdit={true}
          onSubmit={async (formData: BaseTemplateFormData) => {
            if (template._id) {
              await api.template.base.update(template._id, formData);
              toast.success("更新成功");
              refreshBase();
            }
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 提交基础模板表单

  // HTML预览（基础模板）
  const handleBasePreview = (row: BaseTemplate) => {
    let content = row.content || "<p>暂无内容</p>";
    if (row.variables && row.variables.length > 0) {
      row.variables.forEach((variable) => {
        const regex = new RegExp(`{${variable.name}}`, "g");
        content = content.replace(regex, variable.default_value || "");
      });
    }
    preview(content);
  };

  // 删除基础模板
  const handleDeleteBase = async (row: BaseTemplate) => {
    if (!row._id) return;
    await api.template.base.delete(row._id);
    toast.success("删除成功");
    refreshBase();
  };

  // ==================== 自定义模板操作 ====================

  // 新增自定义模板
  const handleCreateCustom = () => {
    createDialog({
      title: "新增自定义模板",
      width: 700,
      component: (
        <CustomTemplateForm
          isEdit={false}
          onSubmit={async (formData: CustomTemplateFormData) => {
            await api.template.custom.create(formData);
            toast.success("创建成功");
            refreshCustom();
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 编辑自定义模板
  const handleEditCustom = (template: CustomTemplate) => {
    createDialog({
      title: "编辑自定义模板",
      width: 700,
      component: (
        <CustomTemplateForm
          initialData={template}
          isEdit={true}
          onSubmit={async (formData: CustomTemplateFormData) => {
            if (template._id) {
              await api.template.custom.update(template._id, formData);
              toast.success("更新成功");
              loadCustomData(
                customPagination.current,
                customPagination.pageSize
              );
            }
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 提交自定义模板表单

  // HTML预览（自定义模板）
  const handleCustomPreview = (row: CustomTemplate) => {
    let content = row.content || "<p>暂无内容</p>";
    if (row.variables) {
      Object.entries(row.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, "g");
        content = content.replace(regex, value || "");
      });
    }
    preview(content);
  };

  // 删除自定义模板
  const handleDeleteCustom = async (row: CustomTemplate) => {
    if (!row._id) return;
    await api.template.custom.delete(row._id);
    toast.success("删除成功");
    refreshCustom();
  };

  // 基础模板表格列配置
  const baseColumns: AntTableColumn<BaseTemplate>[] = [
    {
      title: "UUID",
      dataIndex: "uuid",
      key: "uuid",
      width: 280,
      render: (value) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {value || "-"}
        </span>
      ),
    },
    {
      title: "模板标识",
      dataIndex: "name",
      key: "name",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: "显示名称",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
          {dicts.map.templateCategory[value] || value}
        </span>
      ),
    },
    {
      title: "变量数量",
      dataIndex: "variables",
      key: "variables",
      width: 100,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? value.length : 0}
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || "-"}
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
              text: "预览",
              onClick: () => handleBasePreview(record),
            },
            {
              text: "编辑",
              onClick: () => handleEditBase(record),
            },
            {
              text: "删除",
              onClick: () => handleDeleteBase(record),
              danger: true,
              divider: true,
              confirm: `确定要删除基础模板"${record.name}"吗？`,
            },
          ]}
        />
      ),
    },
  ];

  // 自定义模板表格列配置
  const customColumns: AntTableColumn<CustomTemplate>[] = [
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: "显示名称",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "域名",
      dataIndex: "domain",
      key: "domain",
      width: 200,
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value || "-"}
        </span>
      ),
    },
    {
      title: "基础模板",
      dataIndex: "base_template_id",
      key: "base_template_id",
      width: 150,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || "-"}
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
              : value === "draft"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {dicts.map.templateStatus[value] || value}
        </span>
      ),
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 80,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          v{value || 1}
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || "-"}
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
              text: "预览",
              onClick: () => handleCustomPreview(record),
            },
            {
              text: "编辑",
              onClick: () => handleEditCustom(record),
            },
            {
              text: "删除",
              onClick: () => handleDeleteCustom(record),
              danger: true,
              divider: true,
              confirm: `确定要删除自定义模板"${record.name}"吗？`,
            },
          ]}
        />
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
          onClick={activeTab === "base" ? handleCreateBase : handleCreateCustom}
        >
          {activeTab === "base" ? "新增基础模板" : "新增自定义模板"}
        </AntButton>
      </div>

      {/* Tab 切换按钮 */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("base")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "base"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          基础模板
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "custom"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          自定义模板
        </button>
      </div>

      {/* 表格内容 */}
      {activeTab === "base" ? (
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
    </div>
  );
}
