"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { AntInput, AntSelect, Label } from "@/components";
import {
  Domain,
  DomainFormData,
  DomainStatus,
} from "@/api/domain";
import { useDict } from "@/hooks";

export interface DomainFormProps {
  initialData?: Domain;
  onSubmit: (data: DomainFormData) => Promise<void>;
  onClose?: () => void;
  isEdit?: boolean;
}

export interface DomainFormRef {
  submit: () => Promise<void>;
  cancel: () => void;
}

function normalize_domain(input: string) {
  return input.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

// 状态选项

// 项目组选项类型
interface ProjectOption {
  value: string;
  label: string;
  description: string;
}

const DomainForm = forwardRef<DomainFormRef, DomainFormProps>(
  ({ initialData, onSubmit, onClose, isEdit = false }, ref) => {
    const dicts = useDict();

    const [formData, setFormData] = useState<DomainFormData>({
      domain: "",
      app_name: "",
      email: "",
      project_group: "",
      status: "active",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);

    // 加载项目组选项
    useEffect(() => {
      const loadProjects = async () => {
        try {
          const response = await fetch("/json/projects.json");
          const data = await response.json();
          setProjectOptions(data.projects || []);
        } catch (error) {
          console.error("加载项目组失败:", error);
        }
      };
      loadProjects();
    }, []);

    useEffect(() => {
      if (initialData) {
        setFormData({
          domain: initialData.domain || "",
          app_name: initialData.app_name || "",
          email: initialData.email || "",
          project_group: initialData.project_group || "",
          status: initialData.status || "active",
        });
      } else {
        setFormData({
          domain: "",
          app_name: "",
          email: "",
          project_group: "",
          status: "active",
        });
      }
      setErrors({});
    }, [initialData]);

    const handleInputChange = (field: keyof DomainFormData, value: string) => {
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

      const raw_domain = formData.domain.trim();
      if (/^https?:\/\//i.test(raw_domain)) {
        newErrors.domain = "域名不允许包含协议(http/https)";
      }

      const normalized_domain = normalize_domain(formData.domain);
      if (!normalized_domain) {
        newErrors.domain = "请填写域名";
      } else if (normalized_domain.includes("/")) {
        newErrors.domain = "域名不应包含路径";
      } else if (!/^[a-z0-9.-]+(:\d+)?$/i.test(normalized_domain)) {
        newErrors.domain = "域名格式不正确";
      }

      if (!formData.app_name.trim()) {
        newErrors.app_name = "请填写应用名称";
      }

      if (!formData.email.trim()) {
        newErrors.email = "请填写联系邮箱";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "邮箱格式不正确";
      }

      if (!formData.project_group?.trim()) {
        newErrors.project_group = "请选择项目组";
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
        const normalized_domain = normalize_domain(formData.domain);
        const submitData: DomainFormData = {
          ...formData,
          domain: normalized_domain,
        };

        await onSubmit(submitData);
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
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* 域名 */}
        <div className="space-y-2">
          <Label htmlFor="domain">
            域名 <span className="text-red-500">*</span>
          </Label>
          <AntInput
            id="domain"
            type="text"
            value={formData.domain}
            onChange={(e) => handleInputChange("domain", e.target.value)}
            placeholder="example.com 或 localhost:3000"
            status={errors.domain ? "error" : undefined}
          />
          {errors.domain && (
            <p className="text-xs text-red-500">{errors.domain}</p>
          )}
          <p className="text-xs text-muted-foreground">
            仅填写域名或 host:port，不包含 http/https
          </p>
        </div>

        {/* 应用名称 */}
        <div className="space-y-2">
          <Label htmlFor="app_name">
            应用名称 <span className="text-red-500">*</span>
          </Label>
          <AntInput
            id="app_name"
            type="text"
            value={formData.app_name}
            onChange={(e) => handleInputChange("app_name", e.target.value)}
            placeholder="请输入应用名称"
            status={errors.app_name ? "error" : undefined}
          />
          {errors.app_name && (
            <p className="text-xs text-red-500">{errors.app_name}</p>
          )}
          <p className="text-xs text-muted-foreground">该域名对应的应用名称</p>
        </div>

        {/* 联系邮箱 */}
        <div className="space-y-2">
          <Label htmlFor="email">
            联系邮箱 <span className="text-red-500">*</span>
          </Label>
          <AntInput
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="contact@example.com"
            status={errors.email ? "error" : undefined}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
          <p className="text-xs text-muted-foreground">
            用于接收通知的联系邮箱
          </p>
        </div>

        {/* 项目组 */}
        <div className="space-y-2">
          <Label htmlFor="project_group">
            项目组 <span className="text-red-500">*</span>
          </Label>
          <AntSelect
            value={formData.project_group || ""}
            onChange={(value) =>
              handleInputChange("project_group", String(value))
            }
            placeholder="请选择项目组"
            options={projectOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          {errors.project_group && (
            <p className="text-xs text-red-500">{errors.project_group}</p>
          )}
          <p className="text-xs text-muted-foreground">该域名所属的项目组</p>
        </div>

        {/* 状态 */}
        <div className="space-y-2">
          <Label htmlFor="status">
            状态 <span className="text-red-500">*</span>
          </Label>
          <AntSelect
            value={formData.status}
            onChange={(value) =>
              handleInputChange("status", value as DomainStatus)
            }
            options={dicts.options.domainStatus}
          />
          {errors.status && (
            <p className="text-xs text-red-500">{errors.status}</p>
          )}
        </div>
      </div>
    );
  }
);

DomainForm.displayName = "DomainForm";

export default DomainForm;
