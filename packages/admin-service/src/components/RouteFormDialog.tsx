'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Textarea,
  Label,
  Checkbox,
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
import { RouteRule, RouteFormData, RouteType } from '@/api/route';
import { getDomainOptions } from '@/api/domain';

export interface RouteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: RouteRule;
  onSubmit: (data: RouteFormData) => Promise<void>;
  isEdit?: boolean;
}

// 路由类型选项
const ROUTE_TYPE_OPTIONS: { value: RouteType; label: string }[] = [
  { value: 'exact', label: '精确匹配' },
  { value: 'wildcard', label: '通配符' },
  { value: 'regex', label: '正则表达式' },
];

export default function RouteFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isEdit = false,
}: RouteFormDialogProps) {
  const [formData, setFormData] = useState<RouteFormData>({
    pattern: '',
    type: 'exact',
    domain: '',
    priority: 0,
    enabled: true,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [domainOptions, setDomainOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  // 加载域名选项
  useEffect(() => {
    const loadDomains = async () => {
      setLoadingDomains(true);
      try {
        const domains = await getDomainOptions();
        setDomainOptions(
          (domains || []).map((d) => ({ value: d.value, label: d.label }))
        );
      } catch (error) {
        console.error('加载域名选项失败:', error);
      } finally {
        setLoadingDomains(false);
      }
    };
    if (open) {
      loadDomains();
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        pattern: initialData.pattern || '',
        type: initialData.type || 'exact',
        domain: initialData.domain || '',
        priority: initialData.priority || 0,
        enabled: initialData.enabled !== undefined ? initialData.enabled : true,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        pattern: '',
        type: 'exact',
        domain: '',
        priority: 0,
        enabled: true,
        description: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleInputChange = (field: keyof RouteFormData, value: any) => {
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

    if (!formData.pattern.trim()) {
      newErrors.pattern = '请填写路由模式';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = '请选择域名';
    }

    if (formData.priority === undefined || formData.priority < 0) {
      newErrors.priority = '优先级必须大于等于0';
    }

    // 根据类型验证 pattern
    if (formData.pattern.trim()) {
      if (formData.type === 'regex') {
        try {
          new RegExp(formData.pattern);
        } catch (e) {
          newErrors.pattern = '正则表达式格式无效';
        }
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
      onOpenChange(false);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑路由规则' : '新增路由规则'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
          {/* 路由模式 */}
          <div className="space-y-2">
            <Label htmlFor="pattern">
              路由模式 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pattern"
              type="text"
              value={formData.pattern}
              onChange={(e) => handleInputChange('pattern', e.target.value)}
              placeholder="例如: /api/users 或 /api/* 或 ^/api/.*$"
              className={errors.pattern ? 'border-red-500' : ''}
            />
            {errors.pattern && (
              <p className="text-xs text-red-500">{errors.pattern}</p>
            )}
            <p className="text-xs text-muted-foreground">
              根据匹配类型填写：精确匹配 /api/users，通配符 /api/*，正则 ^/api/.*$
            </p>
          </div>

          {/* 匹配类型 */}
          <div className="space-y-2">
            <Label htmlFor="type">
              匹配类型 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value as RouteType)}
            >
              <SelectTrigger
                id="type"
                className={errors.type ? 'w-full border-red-500' : 'w-full'}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROUTE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type}</p>
            )}
            <p className="text-xs text-muted-foreground">
              精确匹配：完全相等；通配符：支持 * 通配；正则表达式：支持正则匹配
            </p>
          </div>

          {/* 域名 */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              域名 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.domain}
              onValueChange={(value) => handleInputChange('domain', value)}
              disabled={loadingDomains}
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
              选择该路由规则关联的域名
            </p>
          </div>

          {/* 优先级 */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              优先级 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="priority"
              type="number"
              min={0}
              value={formData.priority}
              onChange={(e) =>
                handleInputChange('priority', parseInt(e.target.value) || 0)
              }
              placeholder="0"
              className={errors.priority ? 'border-red-500' : ''}
            />
            {errors.priority && (
              <p className="text-xs text-red-500">{errors.priority}</p>
            )}
            <p className="text-xs text-muted-foreground">
              数值越大优先级越高，默认为 0
            </p>
          </div>

          {/* 启用状态 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                handleInputChange('enabled', checked === true)
              }
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              启用该路由规则
            </Label>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入路由规则描述"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              用于说明该路由规则的用途和配置说明
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
