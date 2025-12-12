"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  FormField,
  AntInput,
  AntSelect,
  type AntSelectOption,
} from "@/components";
import type { User, UserFormData, UserRole, UserStatus } from "@/api/user";
import { useDict } from "@/hooks";

export interface UserFormProps {
  /** 初始数据（编辑时） */
  initialData?: User;
  /** 提交回调 */
  onSubmit: (data: UserFormData) => Promise<void>;
  /** 关闭弹窗回调（由 dialog.dynamic 注入） */
  onClose?: () => void;
  /** 是否编辑模式 */
  isEdit?: boolean;
}

/**
 * 用户表单暴露的方法
 */
export interface UserFormRef {
  /** 提交表单 */
  submit: () => Promise<void>;
  /** 取消操作 */
  cancel: () => void;
}

/**
 * 用户表单组件（纯表单，不包含 Dialog）
 * 用于动态挂载到对话框中
 */
const UserForm = forwardRef<UserFormRef, UserFormProps>(
  ({ initialData, onSubmit, onClose, isEdit = false }, ref) => {
    const dicts = useDict();

    const [formData, setFormData] = useState<UserFormData>({
      username: "",
      email: "",
      password: "",
      role: "viewer",
      status: "active",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      if (initialData) {
        setFormData({
          username: initialData.username || "",
          email: initialData.email || "",
          password: "", // 编辑时密码为空，表示不修改
          role: initialData.role || "viewer",
          status: initialData.status || "active",
        });
      } else {
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "viewer",
          status: "active",
        });
      }
      setErrors({});
    }, [initialData]);

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
        newErrors.username = "请填写用户名";
      } else if (formData.username.length < 3) {
        newErrors.username = "用户名至少3个字符";
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = "用户名只能包含字母、数字和下划线";
      }

      if (!formData.email.trim()) {
        newErrors.email = "请填写邮箱";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "邮箱格式不正确";
      }

      // 新增用户时密码必填，编辑时如果填写了密码则验证
      if (!isEdit) {
        if (!formData.password) {
          newErrors.password = "请填写密码";
        } else if (formData.password.length < 6) {
          newErrors.password = "密码至少6个字符";
        }
      } else if (formData.password && formData.password.length < 6) {
        newErrors.password = "密码至少6个字符";
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
        // 提交成功后关闭弹窗
        onClose?.();
      } catch (error) {
        console.error("提交失败:", error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    };

    const handleCancel = () => {
      onClose?.();
    };

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      cancel: handleCancel,
    }));

    return (
      <div className="space-y-4">
        {/* 用户名 */}
        <FormField
          label="用户名"
          name="username"
          required
          error={errors.username}
          help="用户名只能包含字母、数字和下划线，至少3个字符"
        >
          <AntInput
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="请输入用户名"
            disabled={isEdit}
          />
        </FormField>

        {/* 邮箱 */}
        <FormField label="邮箱" name="email" required error={errors.email}>
          <AntInput
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="user@example.com"
          />
        </FormField>

        {/* 密码 */}
        <FormField
          label="密码"
          name="password"
          required={!isEdit}
          error={errors.password}
          help={isEdit ? "留空表示不修改密码，至少6个字符" : "密码至少6个字符"}
        >
          <AntInput
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder={isEdit ? "留空表示不修改密码" : "请输入密码"}
          />
        </FormField>

        {/* 角色 */}
        <FormField
          label="角色"
          name="role"
          required
          error={errors.role}
          help="管理员：完全权限 | 编辑员：编辑权限 | 查看员：只读权限"
        >
          <AntSelect
            value={formData.role}
            onChange={(value) => handleInputChange("role", value as UserRole)}
            options={dicts.options.userRole}
            placeholder="请选择角色"
          />
        </FormField>

        {/* 状态 */}
        <FormField
          label="状态"
          name="status"
          required
          error={errors.status}
          help="激活：正常使用 | 停用：无法登录 | 暂停：临时禁用"
        >
          <AntSelect
            value={formData.status}
            onChange={(value) =>
              handleInputChange("status", value as UserStatus)
            }
            options={dicts.options.userStatus}
            placeholder="请选择状态"
          />
        </FormField>
      </div>
    );
  }
);

UserForm.displayName = "UserForm";

export default UserForm;
