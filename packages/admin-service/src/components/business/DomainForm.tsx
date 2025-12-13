"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { AntInput, AntSelect, AntButton, Label } from "@/components";
import {
  Domain,
  DomainFormData,
  DomainStatus,
  RouteTemplateMapping,
} from "@/api/domain";
import api from "@/api";
import { useDict } from "@/hooks";
import * as LucideIcons from "lucide-react";

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
      routes: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
    const [routeOptions, setRouteOptions] = useState<
      Array<{ value: string; label: string }>
    >([]);
    const [templateOptions, setTemplateOptions] = useState<
      Array<{ value: string; label: string }>
    >([]);

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

    // 加载路由和模板选项
    useEffect(() => {
      const loadOptions = async () => {
        try {
          const [routesRes, templatesRes] = await Promise.all([
            api.route.list({ limit: 10000 }),
            api.template.custom.list({ limit: 10000 }),
          ]);

          const routes = routesRes.data || [];
          const templates = templatesRes.data || [];

          // 去重：基于 _id
          const uniqueRoutes = Array.from(
            new Map(routes.map((r: any) => [r._id, r])).values()
          );
          setRouteOptions(
            uniqueRoutes.map((r: any) => ({
              value: r._id,
              label: `${r.pattern} (${dicts.map.routeType[r.type] || r.type})`,
            }))
          );

          // 去重：基于 _id
          const uniqueTemplates = Array.from(
            new Map(templates.map((t: any) => [t._id, t])).values()
          );
          setTemplateOptions(
            uniqueTemplates.map((t: any) => ({
              value: t._id,
              label: t.name || "未命名模板",
            }))
          );
        } catch (error) {
          console.error("加载路由和模板选项失败:", error);
        }
      };

      loadOptions();
    }, []);

    useEffect(() => {
      if (initialData) {
        setFormData({
          domain: initialData.domain || "",
          app_name: initialData.app_name || "",
          email: initialData.email || "",
          project_group: initialData.project_group || "",
          status: initialData.status || "active",
          routes: initialData.routes || [],
        });
      } else {
        setFormData({
          domain: "",
          app_name: "",
          email: "",
          project_group: "",
          status: "active",
          routes: [],
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

    // 添加路由-模板映射
    const handleAddRouteMapping = () => {
      setFormData((prev) => ({
        ...prev,
        routes: [...(prev.routes || []), { route: "", template: "" }],
      }));
    };

    // 删除路由-模板映射
    const handleRemoveRouteMapping = (index: number) => {
      setFormData((prev) => ({
        ...prev,
        routes: (prev.routes || []).filter((_, i) => i !== index),
      }));
    };

    // 更新路由-模板映射
    const handleUpdateRouteMapping = (
      index: number,
      field: "route" | "template",
      value: string
    ) => {
      setFormData((prev) => ({
        ...prev,
        routes: (prev.routes || []).map((mapping, i) =>
          i === index ? { ...mapping, [field]: value } : mapping
        ),
      }));
    };

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.domain.trim()) {
        newErrors.domain = "请填写完整域名";
      } else if (!/^https?:\/\/.+/.test(formData.domain)) {
        newErrors.domain = "域名格式不正确，需包含协议(http/https)";
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
        // 过滤掉空的路由-模板映射
        const routes = (formData.routes || []).filter(
          (mapping) => mapping.route && mapping.template
        );

        const submitData: DomainFormData = {
          ...formData,
          routes,
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
            placeholder="https://example.com 或 http://localhost:3000"
            status={errors.domain ? "error" : undefined}
          />
          {errors.domain && (
            <p className="text-xs text-red-500">{errors.domain}</p>
          )}
          <p className="text-xs text-muted-foreground">
            完整域名含协议，如: https://blaze.com 或 http://localhost:3000
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

        {/* 路由-模板映射 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>路由-模板映射（可选）</Label>
            <AntButton
              type="button"
              onClick={handleAddRouteMapping}
              type="default"
              size="small"
              icon={<LucideIcons.Plus className="h-4 w-4" />}
            >
              添加映射
            </AntButton>
          </div>

          {(formData.routes || []).length > 0 && (
            <div className="space-y-3 border rounded-md p-3 bg-muted/30">
              {(formData.routes || []).map((mapping, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-background p-3 rounded-md border"
                >
                  <div className="flex-1 space-y-2">
                    {/* 路由选择 */}
                    <div>
                      <Label className="text-xs">路由</Label>
                      <AntSelect
                        value={mapping.route}
                        onChange={(value) =>
                          handleUpdateRouteMapping(
                            index,
                            "route",
                            String(value)
                          )
                        }
                        placeholder="请选择路由"
                        options={routeOptions}
                      />
                    </div>

                    {/* 模板选择 */}
                    <div>
                      <Label className="text-xs">模板</Label>
                      <AntSelect
                        value={mapping.template}
                        onChange={(value) =>
                          handleUpdateRouteMapping(
                            index,
                            "template",
                            String(value)
                          )
                        }
                        placeholder="请选择模板"
                        options={templateOptions}
                      />
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <AntButton
                    type="button"
                    onClick={() => handleRemoveRouteMapping(index)}
                    danger
                    shape="circle"
                    size="small"
                    className="h-9 w-9 p-0"
                    title="删除映射"
                  >
                    <LucideIcons.Trash2 className="h-4 w-4" />
                  </AntButton>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            配置域名下路由与模板的关联关系，用于生成完整的访问地址
          </p>
        </div>
      </div>
    );
  }
);

DomainForm.displayName = "DomainForm";

export default DomainForm;
