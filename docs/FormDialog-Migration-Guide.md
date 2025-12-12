# FormDialog 迁移指南

## 概述

为了便于后续更换底层组件库，我们创建了 `FormDialog` 封装组件。本文档说明如何将现有的 Dialog 使用代码迁移到 FormDialog。

## FormDialog 组件优势

1. **统一接口**：所有 Dialog 相关逻辑集中管理
2. **易于替换**：更换组件库只需修改 FormDialog 内部实现
3. **简化使用**：减少重复代码，API 更简洁
4. **类型安全**：完整的 TypeScript 类型支持

## 迁移步骤

### 步骤 1：导入变更

**迁移前：**
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components';
```

**迁移后：**
```tsx
import { FormDialog, Button } from '@/components';
```

### 步骤 2：组件结构重构

**迁移前：**
```tsx
return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑' : '新增'}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* 表单内容 */}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button onClick={handleSubmit}>确认</Button>
      </div>
    </DialogContent>
  </Dialog>
);
```

**迁移后：**
```tsx
return (
  <FormDialog
    open={open}
    onOpenChange={onOpenChange}
    title={isEdit ? '编辑' : '新增'}
    footer={
      <>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button onClick={handleSubmit}>确认</Button>
      </>
    }
  >
    <div className="space-y-4">
      {/* 表单内容 */}
    </div>
  </FormDialog>
);
```

## FormDialog API

### Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `open` | `boolean` | ✅ | - | 是否打开对话框 |
| `onOpenChange` | `(open: boolean) => void` | ✅ | - | 打开状态变化回调 |
| `title` | `string` | ✅ | - | 对话框标题 |
| `description` | `string` | ❌ | - | 对话框描述 |
| `children` | `ReactNode` | ✅ | - | 对话框内容 |
| `footer` | `ReactNode` | ❌ | - | 底部按钮区域 |
| `className` | `string` | ❌ | `'sm:max-w-[600px]'` | 对话框宽度样式 |

## 待迁移组件列表

以下组件建议迁移到使用 FormDialog：

- [ ] `UserFormDialog.tsx`
- [ ] `CustomTemplateFormDialog.tsx`
- [ ] `BaseTemplateFormDialog.tsx`
- [ ] `DomainConfigDialog.tsx`
- [ ] `DomainFormDialog.tsx`
- [ ] `RouteFormDialog.tsx`

## 迁移示例

完整的迁移示例请参考 `DomainFormDialog.example.tsx`（示例文件）

## 注意事项

1. **样式保持一致**：迁移后的组件样式应与原组件一致
2. **功能完整性**：确保所有功能正常工作
3. **类型检查**：利用 TypeScript 确保类型安全
4. **渐进式迁移**：可以逐个组件进行迁移，不需要一次性全部完成

## 未来扩展

当需要更换底层组件库时，只需修改 `FormDialog.tsx` 的内部实现即可，所有使用 FormDialog 的组件无需修改。

例如，从 shadcn/ui 切换到 Ant Design：

```tsx
// FormDialog.tsx (使用 Ant Design)
import { Modal } from 'antd';

export function FormDialog({ open, onOpenChange, title, children, footer }: FormDialogProps) {
  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={title}
      footer={footer}
    >
      {children}
    </Modal>
  );
}
```

所有使用 FormDialog 的组件无需任何修改即可适配新的组件库！
