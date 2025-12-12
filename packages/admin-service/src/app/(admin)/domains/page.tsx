"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AntTable,
  AntButton,
  AntSelect,
  type AntTableColumn,
  type AntSelectOption,
} from "@/components";
import { TableActions } from "@/components";
import { toast } from "@/lib/toast";
import { createDialog } from "@/lib/dialog.dynamic";
import { DomainForm } from "@/components";
import DomainConfigDialog from "@/components/business/DomainConfigDialog";
import { useDict, useTableData } from "@/hooks";
import api from "@/api";
import type { Domain, DomainFormData } from "@/api/domain";

export default function DomainManagementPage() {
  const dicts = useDict();
  const { data, loading, pagination, loadData, refresh } = useTableData<Domain>(
    {
      fetchData: api.domain.list,
      initialPageSize: 20,
    }
  );

  const [selectedProjectGroup, setSelectedProjectGroup] =
    useState<string>("all");
  const [projectGroups, setProjectGroups] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    loadProjectGroups();
  }, []);

  // 加载项目组列表
  const loadProjectGroups = async () => {
    try {
      const response = await fetch("/json/projects.json");
      const data = await response.json();
      const groups = data.projects.map((project: any) => project.value);
      setProjectGroups(groups);
    } catch (error) {
      console.error("加载项目组列表失败:", error);
    }
  };

  // 根据选择的项目组过滤数据
  const filteredData = useMemo(() => {
    if (selectedProjectGroup === "all") {
      return data;
    }
    return data.filter((item) => item.project_group === selectedProjectGroup);
  }, [data, selectedProjectGroup]);

  // 项目组选项
  const projectOptions: AntSelectOption[] = [
    { label: "全部项目组", value: "all" },
    ...projectGroups.map((group) => ({
      label: group,
      value: group,
    })),
  ];

  // 新增域名
  const handleCreate = () => {
    const dialog = createDialog({
      title: "新增域名",
      width: 800,
      component: (
        <DomainForm
          isEdit={false}
          onSubmit={async (formData: DomainFormData) => {
            await api.domain.create(formData);
            toast.success("创建成功");
            refresh();
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 编辑域名
  const handleEdit = (domain: Domain) => {
    const dialog = createDialog({
      title: "编辑域名",
      width: 800,
      component: (
        <DomainForm
          initialData={domain}
          isEdit={true}
          onSubmit={async (formData: DomainFormData) => {
            await api.domain.update(domain._id, formData);
            toast.success("更新成功");
            refresh();
          }}
        />
      ),
      buttons: [{ text: "确定", callback: "submit", type: "primary" }],
    });
  };

  // 配置关联
  const handleConfig = (domain: Domain) => {
    const dialog = createDialog({
      title: `${domain.domain} - 配置关联`,
      width: 1000,
      component: (
        <DomainConfigDialog
          domain={domain}
          onClose={() => dialog.close()}
          onSuccess={() => {
            dialog.close();
            refresh();
          }}
        />
      ),
    });
  };

  // 删除域名
  const handleDelete = async (row: Domain) => {
    if (!row._id) return;
    await api.domain.delete(row._id);
    toast.success("删除成功");
    refresh();
  };

  // 表格列配置
  const columns: AntTableColumn<Domain>[] = [
    {
      title: "UUID",
      dataIndex: "uuid",
      key: "uuid",
      width: 280,
      render: (value) => (
        <span className="font-mono text-xs text-gray-600">{value || "-"}</span>
      ),
    },
    {
      title: "域名",
      dataIndex: "domain",
      key: "domain",
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
      title: "应用名称",
      dataIndex: "app_name",
      key: "app_name",
      width: 150,
    },
    {
      title: "项目组",
      dataIndex: "project_group",
      key: "project_group",
      width: 120,
      render: (value) => (
        <span className="text-sm text-gray-700">{value || "-"}</span>
      ),
    },
    {
      title: "联系邮箱",
      dataIndex: "email",
      key: "email",
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
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {dicts.map.domainStatus[value || "inactive"] || value || "inactive"}
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value) => (
        <span className="text-sm text-gray-600">{value || "-"}</span>
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
              text: "配置关联",
              onClick: () => handleConfig(record),
            },
            {
              text: "编辑",
              onClick: () => handleEdit(record),
            },
            {
              text: "删除",
              onClick: () => handleDelete(record),
              danger: true,
              divider: true,
              confirm: `确定要删除域名"${record.domain}"吗？`,
            },
          ]}
        />
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
    </div>
  );
}
