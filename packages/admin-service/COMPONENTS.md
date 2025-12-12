# 组件封装文档

基于 shadcn/ui 的 Ant Design 风格组件封装，提供更简洁的 API 和更好的开发体验。

## 📦 已封装的组件

- **AntButton** - 按钮组件
- **AntInput** - 输入框组件
- **AntTextArea** - 文本域组件
- **AntSelect** - 选择器组件
- **AntTable** - 表格组件
- **AntModal** - 对话框组件（支持声明式和命令式调用）

## 🚀 快速开始

### 1. 导入组件

```tsx
import {
  AntButton,
  AntInput,
  AntSelect,
  AntTable,
  AntModal,
  Modal,
} from '@/components';
```

### 2. 使用组件

#### AntButton - 按钮

```tsx
// 基础用法
<AntButton type="primary">主要按钮</AntButton>
<AntButton type="default">默认按钮</AntButton>
<AntButton type="dashed">虚线按钮</AntButton>
<AntButton type="danger">危险按钮</AntButton>

// 尺寸
<AntButton size="small">小按钮</AntButton>
<AntButton size="medium">中按钮</AntButton>
<AntButton size="large">大按钮</AntButton>

// 状态
<AntButton loading>加载中</AntButton>
<AntButton disabled>禁用</AntButton>
<AntButton block>块级按钮</AntButton>

// 形状
<AntButton shape="circle" icon={<Icon />} />
<AntButton shape="round">圆角按钮</AntButton>
```

**Props:**
- `type`: 'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `loading`: boolean
- `disabled`: boolean
- `block`: boolean
- `danger`: boolean
- `icon`: ReactNode
- `shape`: 'default' | 'circle' | 'round'

---

#### AntInput - 输入框

```tsx
// 基础用法
<AntInput placeholder="请输入" />

// 带清除按钮
<AntInput placeholder="输入内容" allowClear />

// 字数统计
<AntInput placeholder="限制 20 字" maxLength={20} showCount />

// 前后缀
<AntInput prefix="🔍" placeholder="搜索" />
<AntInput suffix="📧" placeholder="邮箱" />

// 前置/后置标签
<AntInput
  addonBefore="https://"
  addonAfter=".com"
  placeholder="网址"
/>

// 文本域
<AntTextArea
  rows={4}
  maxLength={200}
  showCount
  placeholder="多行文本"
/>
```

**AntInput Props:**
- `value`: string
- `placeholder`: string
- `disabled`: boolean
- `size`: 'small' | 'medium' | 'large'
- `prefix`: ReactNode
- `suffix`: ReactNode
- `allowClear`: boolean
- `maxLength`: number
- `showCount`: boolean
- `addonBefore`: ReactNode
- `addonAfter`: ReactNode

---

#### AntSelect - 选择器

```tsx
const options = [
  { label: '选项1', value: '1' },
  { label: '选项2', value: '2' },
  { label: '选项3', value: '3' },
];

// 基础用法
<AntSelect
  options={options}
  placeholder="请选择"
  onChange={(value) => console.log(value)}
/>

// 可清除
<AntSelect
  options={options}
  allowClear
/>

// 分组选项
const groupOptions = [
  {
    label: '管理员',
    value: 'admin',
    children: [
      { label: '超级管理员', value: 'super' },
      { label: '普通管理员', value: 'normal' },
    ],
  },
];

<AntSelect options={groupOptions} />
```

**Props:**
- `value`: string | number
- `options`: AntSelectOption[]
- `placeholder`: string
- `disabled`: boolean
- `allowClear`: boolean
- `loading`: boolean
- `size`: 'small' | 'medium' | 'large'
- `onChange`: (value) => void

---

#### AntTable - 表格

```tsx
// 定义数据类型
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// 定义列
const columns: AntTableColumn<User>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <div>
        <AntButton size="small" type="link">编辑</AntButton>
        <AntButton size="small" type="link" danger>删除</AntButton>
      </div>
    ),
  },
];

// 数据源
const dataSource: User[] = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com' },
];

// 使用表格
<AntTable
  columns={columns}
  dataSource={dataSource}
  rowKey="id"
  // 行选择
  rowSelection={{
    selectedRowKeys,
    onChange: (keys, rows) => setSelectedRowKeys(keys),
  }}
  // 分页
  pagination={{
    current: 1,
    pageSize: 10,
    total: 100,
    onChange: (page, pageSize) => console.log(page, pageSize),
  }}
/>
```

**Props:**
- `columns`: AntTableColumn[]
- `dataSource`: T[]
- `rowKey`: string | function
- `loading`: boolean
- `pagination`: object | false
- `rowSelection`: object
- `size`: 'small' | 'medium' | 'large'
- `bordered`: boolean

**Column Props:**
- `title`: string
- `dataIndex`: string
- `key`: string
- `width`: number | string
- `align`: 'left' | 'center' | 'right'
- `render`: (value, record, index) => ReactNode
- `sorter`: boolean | function
- `ellipsis`: boolean

---

#### AntModal - 对话框

**声明式用法：**

```tsx
const [open, setOpen] = useState(false);

<AntModal
  open={open}
  title="对话框标题"
  onOk={() => setOpen(false)}
  onCancel={() => setOpen(false)}
>
  <p>对话框内容</p>
</AntModal>
```

**命令式用法（推荐）：**

```tsx
// 确认对话框
Modal.confirm({
  title: '确认删除',
  content: '确定要删除这条数据吗？',
  onOk: async () => {
    // 执行删除操作
    await deleteData();
  },
});

// 信息提示
Modal.info({
  title: '提示',
  content: '这是一条信息',
});

// 成功提示
Modal.success({
  title: '成功',
  content: '操作成功！',
});

// 警告提示
Modal.warning({
  title: '警告',
  content: '请注意！',
});

// 错误提示
Modal.error({
  title: '错误',
  content: '操作失败！',
});
```

**Props:**
- `open`: boolean
- `title`: ReactNode
- `content`: ReactNode
- `footer`: ReactNode | null
- `width`: number
- `onOk`: () => void | Promise<void>
- `onCancel`: () => void
- `okText`: string
- `cancelText`: string
- `confirmLoading`: boolean

---

## 🎨 目录结构

```
src/
├── components/
│   ├── AntButton.tsx      # 按钮封装
│   ├── AntInput.tsx       # 输入框封装
│   ├── AntSelect.tsx      # 选择器封装
│   ├── AntTable.tsx       # 表格封装
│   ├── AntModal.tsx       # 对话框封装
│   ├── index.ts           # 统一导出
│   ├── button.tsx         # shadcn 原始组件
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── dialog.tsx
├── lib/
│   └── utils.ts           # cn() 工具函数
└── app/
    └── demo/
        └── page.tsx       # 完整示例页面
```

## 📖 在线示例

访问 `/demo` 路由查看所有组件的完整示例和用法。

## 🔧 扩展组件

如需添加更多组件封装，遵循以下步骤：

1. 使用 shadcn CLI 添加基础组件：
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. 在 `src/components/` 下创建 `Ant[ComponentName].tsx` 封装文件

3. 在 `src/components/index.ts` 中导出新组件

4. 在 `src/app/demo/page.tsx` 中添加使用示例

## 💡 设计原则

1. **KISS 原则** - 保持 API 简洁易用
2. **类型安全** - 完整的 TypeScript 类型定义
3. **DRY 原则** - 避免重复代码，统一封装
4. **一级目录** - 所有组件直接放在 `components/` 下
5. **向下兼容** - 保留 shadcn/ui 原始组件导出

## 🚨 注意事项

1. 所有封装组件都使用 `'use client'` 指令，适用于客户端组件
2. Modal 的命令式调用需要在客户端环境中使用
3. 表格组件默认启用虚拟滚动，适合大数据量场景
4. 样式基于 Tailwind v4 + CSS 变量实现主题定制

## 📝 迁移指南

从 Ant Design 迁移到本组件库：

### 1. 替换导入

```tsx
// 之前
import { Button, Input, Table, Modal } from 'antd';

// 之后
import { AntButton, AntInput, AntTable, Modal } from '@/components';
```

### 2. 调整组件名

```tsx
// 之前
<Button type="primary">按钮</Button>

// 之后
<AntButton type="primary">按钮</AntButton>
```

### 3. API 基本兼容

大部分 API 与 Ant Design 保持一致，少量差异请参考上述文档。

---

**开始迁移业务吧！🎉**
