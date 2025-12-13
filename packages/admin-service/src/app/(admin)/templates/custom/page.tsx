"use client";

import { AntTable, AntButton, type AntTableColumn } from "@/components";
import { TableActions } from "@/components";
import { toast } from "@/lib/toast";
import { createDialog } from "@/lib/dialog.dynamic";
import { CustomTemplateForm } from "@/components";
import api from "@/api";
import type { CustomTemplate, CustomTemplateFormData } from "@/api/template";
import { useTableData, usePreview, useDict } from "@/hooks";
import { RefreshCw } from "lucide-react";

export default function CustomTemplateListPage() {
  const dicts = useDict();
  const preview = usePreview();
  const { data, loading, pagination, loadData, refresh } =
    useTableData<CustomTemplate>({
      fetchData: api.template.custom.list,
      initialPageSize: 20,
    });

  // 新增自定义模板
  const handleCreate = () => {
    createDialog({
      title: "新增自定义模板",
      width: 700,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
      component: (
        <CustomTemplateForm
          isEdit={false}
          onSubmit={async (formData: CustomTemplateFormData) => {
            await api.template.custom.create(formData);
            toast.success("创建成功");
            refresh();
          }}
        />
      ),
    });
  };

  // 编辑自定义模板
  const handleEdit = (template: CustomTemplate) => {
    createDialog({
      title: "编辑自定义模板",
      width: 700,
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
      component: (
        <CustomTemplateForm
          initialData={template}
          isEdit={true}
          onSubmit={async (formData: CustomTemplateFormData) => {
            if (template._id) {
              await api.template.custom.update(template._id, formData);
              toast.success("更新成功");
              refresh();
            }
          }}
        />
      ),
    });
  };

  // HTML预览
  const handlePreview = (row: CustomTemplate) => {
    if (!row.content) return;
    let content = row.content;

    // 替换变量为实际配置的值
    if (row.variables) {
      try {
        const vars =
          typeof row.variables === "string"
            ? JSON.parse(row.variables)
            : row.variables;

        console.log("[预览] 解析后的变量:", vars);

        if (vars && typeof vars === "object" && Object.keys(vars).length > 0) {
          Object.entries(vars).forEach(([name, value]) => {
            const actualValue = String(value || "");
            // 支持两种格式：{{变量名}} 和 {变量名}
            const placeholder1 = `{{${name}}}`;
            const placeholder2 = `{${name}}`;
            console.log(
              `[预览] 替换: ${placeholder1} 或 ${placeholder2} -> ${actualValue}`
            );
            content = content.split(placeholder1).join(actualValue);
            content = content.split(placeholder2).join(actualValue);
          });
        }
      } catch (error) {
        console.error("[预览] 变量解析失败:", error);
      }
    }

    console.log("[预览] 最终内容:", content.substring(0, 200));

    preview(content);
  };

  // 删除自定义模板
  const handleDelete = async (row: CustomTemplate) => {
    if (!row._id) return;
    await api.template.custom.delete(row._id);
    toast.success("删除成功");
    refresh();
  };

  // 表格列配置
  const columns: AntTableColumn<CustomTemplate>[] = [
    { title: "模板名称", dataIndex: "name", key: "name", width: 200 },
    {
      title: "变量数量",
      dataIndex: "variables",
      key: "variables",
      width: 100,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? Object.keys(value).length : 0}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => {
        let colorClass =
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        if (value === "active") {
          colorClass =
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        } else if (value === "draft") {
          colorClass =
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        } else if (value === "archived") {
          colorClass =
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
          >
            {dicts.map.templateStatus[value] || value}
          </span>
        );
      },
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 80,
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
      <div className="flex items-center justify-end gap-3">
        <AntButton
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={refresh}
          title="刷新列表"
        >
          刷新
        </AntButton>
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
