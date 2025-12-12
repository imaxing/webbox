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
import { Domain, DomainFormData, DomainStatus } from '@/api/domain';

export interface DomainFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Domain;
  onSubmit: (data: DomainFormData) => Promise<void>;
  isEdit?: boolean;
}

// 状态选项
const STATUS_OPTIONS: { value: DomainStatus; label: string }[] = [
  { value: 'active', label: '生效' },
  { value: 'inactive', label: '停用' },
];

// 项目组选项类型
interface ProjectOption {
  value: string;
  label: string;
  description: string;
}

export default function DomainFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isEdit = false,
}: DomainFormDialogProps) {
  const [formData, setFormData] = useState<DomainFormData>({
    domain: '',
    app_name: '',
    email: '',
    project_group: '',
    status: 'active',
    config: undefined,
  });

  const [configJson, setConfigJson] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);

  // 加载项目组选项
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/json/projects.json');
        const data = await response.json();
        setProjectOptions(data.projects || []);
      } catch (error) {
        console.error('加载项目组失败:', error);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        domain: initialData.domain || '',
        app_name: initialData.app_name || '',
        email: initialData.email || '',
        project_group: initialData.project_group || '',
        status: initialData.status || 'active',
        config: initialData.config,
      });

      // 将 config 对象转换为 JSON 字符串
      if (initialData.config) {
        setConfigJson(JSON.stringify(initialData.config, null, 2));
      } else {
        setConfigJson('');
      }
    } else {
      setFormData({
        domain: '',
        app_name: '',
        email: '',
        project_group: '',
        status: 'active',
        config: undefined,
      });
      setConfigJson('');
    }
    setErrors({});
  }, [initialData, open]);

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

    if (!formData.domain.trim()) {
      newErrors.domain = '请填写完整域名';
    } else if (!/^https?:\/\/.+/.test(formData.domain)) {
      newErrors.domain = '域名格式不正确，需包含协议(http/https)';
    }

    if (!formData.app_name.trim()) {
      newErrors.app_name = '请填写应用名称';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请填写联系邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.project_group?.trim()) {
      newErrors.project_group = '请选择项目组';
    }

    // 验证 config JSON
    if (configJson.trim()) {
      try {
        const parsed = JSON.parse(configJson);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          newErrors.config = '配置格式必须是对象类型，例如: {"key": "value"}';
        }
      } catch (e) {
        newErrors.config = '配置格式无效，请输入有效的 JSON 对象';
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
      // 解析 config JSON
      let config: Record<string, any> | undefined = undefined;
      if (configJson.trim()) {
        config = JSON.parse(configJson);
      }

      const submitData: DomainFormData = {
        ...formData,
        config,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑域名' : '新增域名'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
          {/* 域名 */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              域名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="domain"
              type="text"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              placeholder="https://example.com 或 http://localhost:3000"
              className={errors.domain ? 'border-red-500' : ''}
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
            <Input
              id="app_name"
              type="text"
              value={formData.app_name}
              onChange={(e) => handleInputChange('app_name', e.target.value)}
              placeholder="请输入应用名称"
              className={errors.app_name ? 'border-red-500' : ''}
            />
            {errors.app_name && (
              <p className="text-xs text-red-500">{errors.app_name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              该域名对应的应用名称
            </p>
          </div>

          {/* 联系邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email">
              联系邮箱 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@example.com"
              className={errors.email ? 'border-red-500' : ''}
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
            <Select
              value={formData.project_group || ''}
              onValueChange={(value) => handleInputChange('project_group', value)}
            >
              <SelectTrigger
                id="project_group"
                className={errors.project_group ? 'w-full border-red-500' : 'w-full'}
              >
                <SelectValue placeholder="请选择项目组" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_group && (
              <p className="text-xs text-red-500">{errors.project_group}</p>
            )}
            <p className="text-xs text-muted-foreground">
              该域名所属的项目组
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
                handleInputChange('status', value as DomainStatus)
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
          </div>

          {/* 额外配置 */}
          <div className="space-y-2">
            <Label htmlFor="config">额外配置 (JSON 格式，可选)</Label>
            <Textarea
              id="config"
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder='{"key1": "value1", "key2": "value2"}'
              rows={6}
              className={`font-mono ${errors.config ? 'border-red-500' : ''}`}
            />
            {errors.config && (
              <p className="text-xs text-red-500">{errors.config}</p>
            )}
            <p className="text-xs text-muted-foreground">
              可选的额外配置项，格式为 JSON 对象: {'{'}
              "key": "value"{'}'}
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
