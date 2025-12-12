"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  FormField,
  AntInput,
  AntTextArea,
  AntSelect,
  type AntSelectOption,
  Checkbox,
  Label,
} from "@/components";
import api from "@/api";
import type { RouteRule, RouteFormData, RouteType } from "@/api/route";
import { useDict } from "@/hooks";

export interface RouteFormProps {
  initialData?: RouteRule;
  onSubmit: (data: RouteFormData) => Promise<void>;
  onClose?: () => void;
  isEdit?: boolean;
}

export interface RouteFormRef {
  submit: () => Promise<void>;
  cancel: () => void;
}

const RouteForm = forwardRef<RouteFormRef, RouteFormProps>(
  ({ initialData, onSubmit, onClose, isEdit = false }, ref) => {
    const dicts = useDict();

    const [formData, setFormData] = useState<RouteFormData>({
      pattern: "",
      type: "exact",
      priority: 0,
      enabled: true,
      description: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      if (initialData) {
        setFormData({
          pattern: initialData.pattern || "",
          type: initialData.type || "exact",
          priority: initialData.priority || 0,
          enabled:
            initialData.enabled !== undefined ? initialData.enabled : true,
          description: initialData.description || "",
        });
      }
      setErrors({});
    }, [initialData]);

    const handleInputChange = (field: keyof RouteFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
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

      if (!formData.pattern.trim()) {
        newErrors.pattern = "请填写路由模式";
      }

      if (formData.priority === undefined || formData.priority < 0) {
        newErrors.priority = "优先级必须大于等于0";
      }

      if (formData.pattern.trim() && formData.type === "regex") {
        try {
          new RegExp(formData.pattern);
        } catch (e) {
          newErrors.pattern = "正则表达式格式无效";
        }
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
        await onSubmit(formData);
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

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      cancel: handleCancel,
    }));

    return (
      <div className="space-y-4">
        <FormField
          label="路由模式"
          name="pattern"
          required
          error={errors.pattern}
          help="根据匹配类型填写：精确匹配 /api/users，通配符 /api/*，正则 ^/api/.*$"
        >
          <AntInput
            id="pattern"
            value={formData.pattern}
            onChange={(e) => handleInputChange("pattern", e.target.value)}
            placeholder="例如: /api/users 或 /api/* 或 ^/api/.*$"
          />
        </FormField>

        <FormField
          label="匹配类型"
          name="type"
          required
          error={errors.type}
          help="精确匹配：完全相等；通配符：支持 * 通配；正则表达式：支持正则匹配"
        >
          <AntSelect
            value={formData.type}
            onChange={(value) => handleInputChange("type", value as RouteType)}
            options={dicts.options.routeType}
            placeholder="请选择匹配类型"
          />
        </FormField>

        <FormField
          label="优先级"
          name="priority"
          required
          error={errors.priority}
          help="数值越大优先级越高，默认为 0"
        >
          <AntInput
            id="priority"
            type="number"
            value={String(formData.priority)}
            onChange={(e) =>
              handleInputChange("priority", parseInt(e.target.value) || 0)
            }
            placeholder="0"
          />
        </FormField>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) =>
              handleInputChange("enabled", checked === true)
            }
          />
          <Label htmlFor="enabled" className="cursor-pointer">
            启用该路由规则
          </Label>
        </div>

        <FormField
          label="描述"
          name="description"
          help="用于说明该路由规则的用途和配置说明"
        >
          <AntTextArea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="请输入路由规则描述"
            rows={3}
          />
        </FormField>
      </div>
    );
  }
);

RouteForm.displayName = "RouteForm";

export default RouteForm;
