'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Textarea,
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
import {
  CustomTemplate,
  CustomTemplateFormData,
  CustomTemplateStatus,
  getBaseTemplateOptions,
  getBaseTemplateInfo,
  TemplateVariable,
} from '@/api/template';
import { getDomainOptions } from '@/api/domain';
import { Plus, Trash2 } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

export interface CustomTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CustomTemplate;
  onSubmit: (data: CustomTemplateFormData) => Promise<void>;
  isEdit?: boolean;
}

// 状态选项
const STATUS_OPTIONS: { value: CustomTemplateStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '生效' },
  { value: 'archived', label: '归档' },
];

export default function CustomTemplateFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isEdit = false,
}: CustomTemplateFormDialogProps) {
  const [formData, setFormData] = useState<CustomTemplateFormData>({
    name: '',
    display_name: '',
    domain: '',
    base_template_id: '',
    content: '',
    variables: {},
    status: 'draft',
    version: 1,
  });

  const [variablesList, setVariablesList] = useState<
    Array<{ name: string; value: string }>
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [domainOptions, setDomainOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [baseTemplateOptions, setBaseTemplateOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [baseTemplateVariables, setBaseTemplateVariables] = useState<
    TemplateVariable[]
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // 加载选项数据
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [domains, templates] = await Promise.all([
          getDomainOptions(),
          getBaseTemplateOptions(),
        ]);
        setDomainOptions(
          (domains || []).map((d) => ({ value: d.value, label: d.label }))
        );
        setBaseTemplateOptions((templates as any) || []);
      } catch (error) {
        console.error('加载选项失败:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (open) {
      loadOptions();
    }
  }, [open]);

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        display_name: initialData.display_name || '',
        domain: initialData.domain || '',
        base_template_id: initialData.base_template_id || '',
        content: initialData.content || '',
        variables: initialData.variables || {},
        status: initialData.status || 'draft',
        version: initialData.version || 1,
      });

      // 将变量对象转换为数组
      if (
        initialData.variables &&
        Object.keys(initialData.variables).length > 0
      ) {
        const vars = Object.entries(initialData.variables).map(
          ([name, value]) => ({
            name,
            value,
          })
        );
        setVariablesList(vars);
      } else {
        setVariablesList([]);
      }
    } else {
      setFormData({
        name: '',
        display_name: '',
        domain: '',
        base_template_id: '',
        content: '',
        variables: {},
        status: 'draft',
        version: 1,
      });
      setVariablesList([]);
    }
    setErrors({});
  }, [initialData, open]);

  const handleInputChange = (
    field: keyof CustomTemplateFormData,
    value: string | number | Record<string, string>
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

  // 当基础模板改变时，加载其内容和变量
  const handleBaseTemplateChange = async (templateId: string) => {
    handleInputChange('base_template_id', templateId);

    if (!templateId) {
      setBaseTemplateVariables([]);
      return;
    }

    try {
      const template = await getBaseTemplateInfo(templateId);
      // 如果当前内容为空，则使用基础模板的内容
      if (!formData.content) {
        setFormData((prev) => ({ ...prev, content: template.content || '' }));
      }

      // 保存基础模板的变量定义
      setBaseTemplateVariables(template.variables || []);

      // 自动初始化变量列表（如果当前列表为空）
      if (
        variablesList.length === 0 &&
        template.variables &&
        template.variables.length > 0
      ) {
        const vars = template.variables.map((v) => ({
          name: v.name,
          value: v.default_value || '',
        }));
        setVariablesList(vars);
      }
    } catch (error) {
      console.error('加载基础模板失败:', error);
    }
  };

  // 添加变量
  const handleAddVariable = (variableName?: string) => {
    setVariablesList([
      ...variablesList,
      {
        name: variableName || '',
        value: '',
      },
    ]);
  };

  // 删除变量
  const handleRemoveVariable = (index: number) => {
    setVariablesList(variablesList.filter((_, i) => i !== index));
  };

  // 更新变量
  const handleUpdateVariable = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    const newVariables = [...variablesList];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setVariablesList(newVariables);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请填写模板名称';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = '请填写显示名称';
    }

    if (!formData.domain) {
      newErrors.domain = '请选择域名';
    }

    if (!formData.base_template_id) {
      newErrors.base_template_id = '请选择基础模板';
    }

    // 验证变量列表
    for (let i = 0; i < variablesList.length; i++) {
      const v = variablesList[i];
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
      // 将变量数组转换为对象
      const variables: Record<string, string> = {};
      variablesList.forEach((v) => {
        if (v.name.trim()) {
          variables[v.name] = v.value;
        }
      });

      const submitData: CustomTemplateFormData = {
        ...formData,
        variables,
      };

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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? '编辑自定义模板' : '新增自定义模板'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
          {/* 模板名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              模板名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="例如: privacy-policy-blaze"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            <p className="text-xs text-muted-foreground">
              定制模板的唯一标识符
            </p>
          </div>

          {/* 显示名称 */}
          <div className="space-y-2">
            <Label htmlFor="display_name">
              显示名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display_name"
              type="text"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="例如: Blaze隐私政策"
              className={errors.display_name ? 'border-red-500' : ''}
            />
            {errors.display_name && (
              <p className="text-xs text-red-500">{errors.display_name}</p>
            )}
          </div>

          {/* 域名选择 */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              域名 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.domain}
              onValueChange={(value) => handleInputChange('domain', value)}
              disabled={loadingOptions}
            >
              <SelectTrigger
                id="domain"
                className={errors.domain ? 'w-full border-red-500' : 'w-full'}
              >
                <SelectValue placeholder="请选择域名" />
              </SelectTrigger>
              <SelectContent>
                {domainOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.domain && (
              <p className="text-xs text-red-500">{errors.domain}</p>
            )}
            <p className="text-xs text-muted-foreground">
              模板所属的域名
            </p>
          </div>

          {/* 基础模板 */}
          <div className="space-y-2">
            <Label htmlFor="base_template">
              基础模板 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.base_template_id}
              onValueChange={handleBaseTemplateChange}
              disabled={loadingOptions}
            >
              <SelectTrigger
                id="base_template"
                className={errors.base_template_id ? 'w-full border-red-500' : 'w-full'}
              >
                <SelectValue placeholder="请选择基础模板" />
              </SelectTrigger>
              <SelectContent>
                {baseTemplateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.base_template_id && (
              <p className="text-xs text-red-500">{errors.base_template_id}</p>
            )}
            <p className="text-xs text-muted-foreground">
              关联的基础模板标识符
            </p>
          </div>

          {/* 变量配置 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>变量配置</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddVariable()}
              >
                <Plus className="h-3 w-3 mr-1" />
                添加变量
              </Button>
            </div>

            {errors.variables && (
              <p className="text-xs text-red-500">{errors.variables}</p>
            )}

            <p className="text-xs text-muted-foreground">
              配置模板中使用的变量值。基础模板定义的变量会自动显示。
            </p>

            {variablesList.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  暂无变量，点击"添加变量"按钮开始配置
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {variablesList.map((variable, index) => {
                  // 检查这个变量是否在基础模板中定义
                  const baseVar = baseTemplateVariables.find(
                    (v) => v.name === variable.name
                  );

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          变量 {index + 1}
                          {baseVar && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                              (来自基础模板{baseVar.required ? ' - 必填' : ''})
                            </span>
                          )}
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
                              handleUpdateVariable(index, 'name', e.target.value)
                            }
                            placeholder="变量名"
                            className="h-8 text-sm"
                            disabled={!!baseVar} // 如果是基础模板变量，禁用名称编辑
                          />
                          {baseVar?.description && (
                            <p className="text-xs text-muted-foreground">
                              {baseVar.description}
                            </p>
                          )}
                        </div>

                        {/* 变量值 */}
                        <div className="space-y-1">
                          <Label htmlFor={`var-value-${index}`} className="text-xs">
                            值
                            {baseVar?.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id={`var-value-${index}`}
                            type="text"
                            value={variable.value}
                            onChange={(e) =>
                              handleUpdateVariable(index, 'value', e.target.value)
                            }
                            placeholder="变量值"
                            className="h-8 text-sm"
                          />
                          {baseVar && (
                            <p className="text-xs text-muted-foreground">
                              类型: {baseVar.type}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 未使用的基础模板变量提示 */}
            {baseTemplateVariables.length > 0 && (
              <div className="mt-3">
                {baseTemplateVariables
                  .filter(
                    (baseVar) =>
                      !variablesList.some((v) => v.name === baseVar.name)
                  )
                  .map((missingVar) => (
                    <div
                      key={missingVar.name}
                      className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs mb-2"
                    >
                      <span className="text-yellow-800 dark:text-yellow-200">
                        基础模板变量 "{missingVar.name}" 尚未配置
                        {missingVar.required && ' (必填)'}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddVariable(missingVar.name)}
                        className="h-6 text-xs"
                      >
                        添加
                      </Button>
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
              onChange={(value) => handleInputChange('content', value)}
              placeholder="可自定义HTML内容，留空则使用基础模板"
              variables={variablesList.map((v) => v.name).filter((name) => name)}
              variableValues={variablesList.reduce((acc, v) => {
                if (v.name && v.value) {
                  acc[v.name] = v.value;
                }
                return acc;
              }, {} as Record<string, string>)}
            />
            <p className="text-xs text-muted-foreground">
              使用富文本编辑器编辑内容。图片会自动转换为base64格式。点击下方变量可快速插入。配置了值的变量会以紫色高亮显示，未配置的变量以黄色高亮显示。
            </p>
          </div>

          {/* 状态 */}
          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleInputChange('status', value as CustomTemplateStatus)
              }
            >
              <SelectTrigger id="status" className="w-full">
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
          </div>

          {/* 版本号 */}
          <div className="space-y-2">
            <Label htmlFor="version">版本号</Label>
            <Input
              id="version"
              type="number"
              min={1}
              value={formData.version}
              onChange={(e) =>
                handleInputChange('version', parseInt(e.target.value) || 1)
              }
            />
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
