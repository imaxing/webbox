'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components';
import { User, UserFormData, UserRole, UserStatus } from '@/api/user';

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  isEdit?: boolean;
}

// 角色选项
const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: '管理员' },
  { value: 'editor', label: '编辑员' },
  { value: 'viewer', label: '查看员' },
];

// 状态选项
const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: '激活' },
  { value: 'inactive', label: '停用' },
  { value: 'suspended', label: '暂停' },
];

export default function UserFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isEdit = false,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'viewer',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        password: '', // 编辑时密码为空，表示不修改
        role: initialData.role || 'viewer',
        status: initialData.status || 'active',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'viewer',
        status: 'active',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '请填写用户名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请填写邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    // 新增用户时密码必填，编辑时如果填写了密码则验证
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = '请填写密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6个字符';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = '密码至少6个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const submitData: UserFormData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };

      // 只有在密码不为空时才提交密码
      if (formData.password) {
        submitData.password = formData.password;
      }

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username">
              用户名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="请输入用户名"
              disabled={isEdit}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
            <p className="text-xs text-muted-foreground">
              用户名只能包含字母、数字和下划线，至少3个字符
            </p>
          </div>

          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email">
              邮箱 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <Label htmlFor="password">
              密码 {!isEdit && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={isEdit ? '留空表示不修改密码' : '请输入密码'}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {isEdit ? '留空表示不修改密码，至少6个字符' : '密码至少6个字符'}
            </p>
          </div>

          {/* 角色 */}
          <div className="space-y-2">
            <Label htmlFor="role">
              角色 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                handleInputChange('role', value as UserRole)
              }
            >
              <SelectTrigger
                id="role"
                className={errors.role ? 'w-full border-red-500' : 'w-full'}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            <p className="text-xs text-muted-foreground">
              管理员：完全权限 | 编辑员：编辑权限 | 查看员：只读权限
            </p>
          </div>

          {/* 状态 */}
          <div className="space-y-2">
            <Label htmlFor="status">
              状态 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleInputChange('status', value as UserStatus)
              }
            >
              <SelectTrigger
                id="status"
                className={errors.status ? 'w-full border-red-500' : 'w-full'}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status}</p>
            )}
            <p className="text-xs text-muted-foreground">
              激活：正常使用 | 停用：无法登录 | 暂停：临时禁用
            </p>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : '确认'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
