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
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  AntButton,
} from "@/components";
import type {
  BaseTemplate,
  BaseTemplateFormData,
  TemplateCategory,
  TemplateVariable,
  VariableType,
} from "@/api/template";
import { Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components";
import { useDict } from "@/hooks";

export interface BaseTemplateFormProps {
  initialData?: BaseTemplate;
  onSubmit: (data: BaseTemplateFormData) => Promise<void>;
  onClose?: () => void;
  isEdit?: boolean;
}

export interface BaseTemplateFormRef {
  submit: () => Promise<void>;
  cancel: () => void;
}

// 模板分类映射

const BaseTemplateForm = forwardRef<BaseTemplateFormRef, BaseTemplateFormProps>(
  ({ initialData, onSubmit, onClose, isEdit = false }, ref) => {
    const dicts = useDict();

    const [formData, setFormData] = useState<BaseTemplateFormData>({
      name: "",
      category: "policy",
      content: "",
      variables: [],
      description: "",
    });

    const [variables, setVariables] = useState<TemplateVariable[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          category: initialData.category || "policy",
          content: initialData.content || "",
          variables: initialData.variables || [],
          description: initialData.description || "",
        });

        // 加载变量列表，并确保 default_value 为空
        if (initialData.variables && initialData.variables.length > 0) {
          const cleanedVariables = initialData.variables.map((v) => ({
            ...v,
            default_value: "",
          }));
          setVariables(cleanedVariables);
        } else {
          setVariables([]);
        }
      } else {
        setFormData({
          name: "",
          category: "policy",
          content: "",
          variables: [],
          description: "",
        });
        setVariables([]);
      }
      setErrors({});
    }, [initialData]);

    const handleInputChange = (
      field: keyof BaseTemplateFormData,
      value: string
    ) => {
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

    // 添加变量
    const handleAddVariable = () => {
      setVariables([
        ...variables,
        {
          name: "",
          type: "text",
          required: false,
          default_value: "",
          description: "",
        },
      ]);
    };

    // 删除变量
    const handleRemoveVariable = (index: number) => {
      setVariables(variables.filter((_, i) => i !== index));
    };

    // 更新变量
    const handleUpdateVariable = (
      index: number,
      field: keyof TemplateVariable,
      value: any
    ) => {
      const newVariables = [...variables];
      newVariables[index] = { ...newVariables[index], [field]: value };
      setVariables(newVariables);
    };

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = "请填写模板名称";
      }

      if (!formData.category) {
        newErrors.category = "请选择分类";
      }

      // 验证变量列表
      for (let i = 0; i < variables.length; i++) {
        const v = variables[i];
        if (!v.name.trim()) {
          newErrors.variables = `第 ${i + 1} 个变量的名称不能为空`;
          break;
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
        // 确保所有变量的 default_value 为空字符串
        const cleanedVariables = variables.map((v) => ({
          ...v,
          default_value: "",
        }));

        const submitData: BaseTemplateFormData = {
          ...formData,
          variables: cleanedVariables,
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

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      cancel: handleCancel,
    }));

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* 模板名称 */}
        <div className="space-y-2">
          <Label htmlFor="name">
            模板名称 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="例如: 隐私政策模板"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          <p className="text-xs text-muted-foreground">
            基础模板的名称
          </p>
        </div>

        {/* 分类 */}
        <div className="space-y-2">
          <Label htmlFor="category">
            分类 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              handleInputChange("category", value as TemplateCategory)
            }
          >
            <SelectTrigger
              id="category"
              className={errors.category ? "w-full border-red-500" : "w-full"}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dicts.options.templateCategory.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        {/* 变量配置 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>变量配置</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddVariable}
            >
              添加变量
            </Button>
          </div>

          {errors.variables && (
            <p className="text-xs text-red-500">{errors.variables}</p>
          )}

          <p className="text-xs text-muted-foreground">
            定义模板中可使用的变量。每个变量包括名称、类型、是否必需等配置。
          </p>

          {variables.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                暂无变量，点击"添加变量"按钮开始配置
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      变量 {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      title="删除变量"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 变量名称 */}
                    <div className="space-y-1">
                      <Label htmlFor={`var-name-${index}`} className="text-xs">
                        名称 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`var-name-${index}`}
                        type="text"
                        value={variable.name}
                        onChange={(e) =>
                          handleUpdateVariable(index, "name", e.target.value)
                        }
                        placeholder="app_name"
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* 变量类型 */}
                    <div className="space-y-1">
                      <Label htmlFor={`var-type-${index}`} className="text-xs">
                        类型
                      </Label>
                      <Select
                        value={variable.type}
                        onValueChange={(value) =>
                          handleUpdateVariable(
                            index,
                            "type",
                            value as VariableType
                          )
                        }
                      >
                        <SelectTrigger
                          id={`var-type-${index}`}
                          className="h-8 text-sm w-full"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dicts.options.variableType.map((opt: any) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 描述 */}
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor={`var-desc-${index}`} className="text-xs">
                        描述
                      </Label>
                      <Input
                        id={`var-desc-${index}`}
                        type="text"
                        value={variable.description}
                        onChange={(e) =>
                          handleUpdateVariable(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="变量说明（可选）"
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* 是否必需 */}
                    <div className="col-span-2 flex items-center space-x-2">
                      <Checkbox
                        id={`var-required-${index}`}
                        checked={variable.required}
                        onCheckedChange={(checked) =>
                          handleUpdateVariable(
                            index,
                            "required",
                            checked === true
                          )
                        }
                      />
                      <Label
                        htmlFor={`var-required-${index}`}
                        className="text-xs cursor-pointer"
                      >
                        必填项
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 模板内容 */}
        <div className="space-y-2">
          <Label htmlFor="content">模板内容</Label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => handleInputChange("content", value)}
            placeholder="编辑模板HTML内容"
            variables={variables.map((v) => v.name).filter((name) => name)}
          />
          <p className="text-xs text-muted-foreground">
            使用富文本编辑器编辑内容。图片会自动转换为base64格式。点击下方变量可快速插入。
          </p>
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="请输入模板描述(可选)"
            rows={3}
          />
        </div>
      </div>
    );
  }
);

BaseTemplateForm.displayName = "BaseTemplateForm";

export default BaseTemplateForm;
