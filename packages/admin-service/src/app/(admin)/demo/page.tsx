'use client';

import React from 'react';
import {
  AntTable,
  AntButton,
  AntSelect,
  AntInput,
  AntTextArea,
  AntModal,
  Modal,
  type AntTableColumn,
  type AntSelectOption,
} from '@/components';

// 示例数据类型
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export default function DemoPage() {
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState<string | number>();

  // 表格数据
  const dataSource: User[] = [
    {
      id: 1,
      name: '张三',
      age: 32,
      email: 'zhangsan@example.com',
      role: '管理员',
      status: 'active',
    },
    {
      id: 2,
      name: '李四',
      age: 28,
      email: 'lisi@example.com',
      role: '用户',
      status: 'active',
    },
    {
      id: 3,
      name: '王五',
      age: 35,
      email: 'wangwu@example.com',
      role: '编辑',
      status: 'inactive',
    },
  ];

  // 表格列配置
  const columns: AntTableColumn<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 100,
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value === 'active' ? '激活' : '未激活'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <div className="flex gap-2">
          <AntButton size="small" type="link" onClick={() => handleEdit(record)}>
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

  // Select 选项
  const selectOptions: AntSelectOption[] = [
    { label: '全部', value: 'all' },
    { label: '管理员', value: 'admin' },
    { label: '用户', value: 'user' },
    { label: '编辑', value: 'editor' },
  ];

  // 处理编辑
  const handleEdit = (record: User) => {
    Modal.info({
      title: '编辑用户',
      content: `编辑用户：${record.name}`,
    });
  };

  // 处理删除
  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 ${record.name} 吗？`,
      type: 'warning',
      onOk: async () => {
        console.log('删除用户:', record);
        // 模拟异步操作
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
    });
  };

  // 批量操作
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: '提示',
        content: '请先选择要删除的数据',
      });
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条数据吗？`,
      type: 'error',
      onOk: async () => {
        console.log('批量删除:', selectedRowKeys);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSelectedRowKeys([]);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">组件示例</h1>
        <p className="text-sm text-muted-foreground mt-1">
          基于 shadcn/ui 的 Ant Design 风格组件封装
        </p>
      </div>

        {/* Button 示例 */}
        <section className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">按钮组件 (AntButton)</h2>
          <div className="flex flex-wrap gap-4">
            <AntButton type="primary">主要按钮</AntButton>
            <AntButton type="default">默认按钮</AntButton>
            <AntButton type="dashed">虚线按钮</AntButton>
            <AntButton type="text">文本按钮</AntButton>
            <AntButton type="link">链接按钮</AntButton>
            <AntButton type="primary" danger>
              危险按钮
            </AntButton>
          </div>
          <div className="flex flex-wrap gap-4">
            <AntButton type="primary" size="large">
              大按钮
            </AntButton>
            <AntButton type="primary" size="medium">
              中按钮
            </AntButton>
            <AntButton type="primary" size="small">
              小按钮
            </AntButton>
          </div>
          <div className="flex flex-wrap gap-4">
            <AntButton type="primary" loading>
              加载中
            </AntButton>
            <AntButton type="primary" disabled>
              禁用状态
            </AntButton>
            <AntButton type="primary" block>
              块级按钮
            </AntButton>
          </div>
        </section>

        {/* Input 示例 */}
        <section className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">输入框组件 (AntInput)</h2>
          <div className="space-y-3 max-w-md">
            <AntInput placeholder="基础输入框" />
            <AntInput placeholder="带清除按钮" allowClear />
            <AntInput
              placeholder="带字数统计"
              maxLength={20}
              showCount
              allowClear
            />
            <AntInput placeholder="前缀图标" prefix="🔍" />
            <AntInput placeholder="后缀图标" suffix="📧" />
            <AntInput
              placeholder="前置标签"
              addonBefore="https://"
              addonAfter=".com"
            />
            <AntTextArea
              placeholder="文本域"
              rows={4}
              maxLength={200}
              showCount
            />
          </div>
        </section>

        {/* Select 示例 */}
        <section className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">选择器组件 (AntSelect)</h2>
          <div className="flex flex-wrap gap-4">
            <AntSelect
              placeholder="请选择角色"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              className="w-48"
            />
            <AntSelect
              placeholder="可清除"
              options={selectOptions}
              allowClear
              className="w-48"
            />
            <AntSelect placeholder="禁用状态" options={selectOptions} disabled className="w-48" />
          </div>
        </section>

        {/* Modal 示例 */}
        <section className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">对话框组件 (AntModal / Modal)</h2>
          <div className="flex flex-wrap gap-4">
            <AntButton type="primary" onClick={() => setModalOpen(true)}>
              声明式 Modal
            </AntButton>
            <AntButton
              onClick={() =>
                Modal.confirm({
                  title: '确认操作',
                  content: '这是一个确认对话框',
                })
              }
            >
              Modal.confirm
            </AntButton>
            <AntButton
              onClick={() =>
                Modal.info({
                  title: '信息提示',
                  content: '这是一条信息',
                })
              }
            >
              Modal.info
            </AntButton>
            <AntButton
              onClick={() =>
                Modal.success({
                  title: '成功提示',
                  content: '操作成功！',
                })
              }
            >
              Modal.success
            </AntButton>
            <AntButton
              onClick={() =>
                Modal.warning({
                  title: '警告提示',
                  content: '请注意！',
                })
              }
            >
              Modal.warning
            </AntButton>
            <AntButton
              onClick={() =>
                Modal.error({
                  title: '错误提示',
                  content: '操作失败！',
                })
              }
            >
              Modal.error
            </AntButton>
          </div>

          <AntModal
            open={modalOpen}
            title="示例对话框"
            onOk={() => setModalOpen(false)}
            onCancel={() => setModalOpen(false)}
          >
            <p>这是一个声明式的对话框示例</p>
          </AntModal>
        </section>

        {/* Table 示例 */}
        <section className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">表格组件 (AntTable)</h2>
            <div className="flex gap-2">
              <AntButton type="primary">新增用户</AntButton>
              <AntButton danger onClick={handleBatchDelete}>
                批量删除
              </AntButton>
            </div>
          </div>

          <AntTable
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            pagination={{
              current: 1,
              pageSize: 10,
              total: 3,
              onChange: (page, pageSize) => {
                console.log('分页变化:', page, pageSize);
              },
            }}
          />
        </section>
    </div>
  );
}
