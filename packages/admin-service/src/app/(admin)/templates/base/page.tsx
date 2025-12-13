"use client";

import React, { useState, useEffect } from "react";
import { AntTable, AntButton, Modal, type AntTableColumn } from "@/components";
import { TableActions } from "@/components";
import { toast } from "@/lib/toast";
import { createDialog } from "@/lib/dialog.dynamic";
import { BaseTemplateForm } from "@/components";
import api from "@/api";
import type { BaseTemplate, BaseTemplateFormData } from "@/api/template";
import { useTableData, usePreview, useDict } from "@/hooks";

export default function BaseTemplateListPage() {
  const dicts = useDict();
  const preview = usePreview();
  const { data, loading, pagination, loadData, refresh } =
    useTableData<BaseTemplate>({
      fetchData: api.template.base.list,
      initialPageSize: 20,
    });

  // 新增基础模板
  const handleCreate = () => {
    createDialog({
      title: "新增基础模板",
      width: 750,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
      component: (
        <BaseTemplateForm
          isEdit={false}
          onSubmit={async (formData: BaseTemplateFormData) => {
            await api.template.base.create(formData);
            toast.success("创建成功");
            refresh();
          }}
        />
      ),
    });
  };

  // 编辑基础模板
  const handleEdit = (template: BaseTemplate) => {
    createDialog({
      title: "编辑基础模板",
      width: 750,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
      component: (
        <BaseTemplateForm
          initialData={template}
          isEdit={true}
          onSubmit={async (formData: BaseTemplateFormData) => {
            if (template._id) {
              await api.template.base.update(template._id, formData);
            }
            toast.success("更新成功");
            refresh();
          }}
        />
      ),
    });
  };

  // HTML预览
  const handlePreview = (row: BaseTemplate) => {
    if (!row.content) return;
    let content = row.content;

    // 替换变量为默认值或示例值
    if (row.variables) {
      const vars = Array.isArray(row.variables)
        ? row.variables
        : typeof row.variables === "string"
        ? JSON.parse(row.variables)
        : [];

      if (vars && vars.length > 0) {
        vars.forEach((variable: any) => {
          const value = variable.default_value || "";
          // 支持两种格式：{{变量名}} 和 {变量名}
          const placeholder1 = `{{${variable.name}}}`;
          const placeholder2 = `{${variable.name}}`;
          content = content.split(placeholder1).join(value);
          content = content.split(placeholder2).join(value);
        });
      }
    }

    preview(content);
  };

  // 删除基础模板
  const handleDelete = async (row: BaseTemplate) => {
    if (!row._id) return;
    await api.template.base.delete(row._id);
    toast.success("删除成功");
    refresh();
  };

  // 表格列配置
  const columns: AntTableColumn<BaseTemplate>[] = [
    { title: "UUID", dataIndex: "uuid", key: "uuid", width: 280 },
    { title: "模板名称", dataIndex: "name", key: "name" },
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
    { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 180 },
    {
      title: "操作",
      key: "action",
      width: 80,
      render: (_, record) => (
        <TableActions
          actions={[
            {
              text: "预览",
              onClick: () => handlePreview(record),
            },
            {
              text: "编辑",
              onClick: () => handleEdit(record),
            },
            {
              text: "删除",
              confirm: `确定要删除该模板吗？`,
              onClick: () => handleDelete(record),
              danger: true,
              divider: true,
            },
          ]}
        />
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
