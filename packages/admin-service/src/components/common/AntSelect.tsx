"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// 选项类型
export interface AntSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: AntSelectOption[];
}

// Select 组件属性
export interface AntSelectProps {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  options?: AntSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  loading?: boolean;
  size?: "small" | "medium" | "large";
  mode?: "multiple" | "tags";
  maxTagCount?: number;
  className?: string;
  style?: React.CSSProperties;
  dropdownClassName?: string;
  notFoundContent?: React.ReactNode;
  filterOption?:
    | boolean
    | ((input: string, option?: AntSelectOption) => boolean);
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

export function AntSelect({
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder = "请选择",
  disabled = false,
  allowClear = false,
  showSearch = false,
  loading = false,
  size = "medium",
  className,
  style,
  dropdownClassName,
  notFoundContent = "暂无数据",
}: AntSelectProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [internalValue, setInternalValue] = React.useState<
    string | number | undefined
  >(value || defaultValue);

  // 同步外部 value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setInternalValue(undefined);
    onChange?.("" as any);
  };

  // 过滤选项
  const filteredOptions = React.useMemo(() => {
    if (!showSearch || !searchValue) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue, showSearch]);

  // 尺寸样式
  const sizeStyles = {
    small: "h-8 text-xs",
    medium: "h-10 text-sm",
    large: "h-12 text-base",
  };

  // 渲染选项组
  const renderOptions = (opts: AntSelectOption[], level = 0) => {
    return opts.map((option) => {
      if (option.children && option.children.length > 0) {
        return (
          <SelectGroup key={option.value}>
            <SelectLabel className="pl-2">{option.label}</SelectLabel>
            {renderOptions(option.children, level + 1)}
          </SelectGroup>
        );
      }
      return (
        <SelectItem
          key={option.value}
          value={String(option.value)}
          disabled={option.disabled}
          className={cn(level > 0 && `pl-${(level + 1) * 4}`)}
        >
          {option.label}
        </SelectItem>
      );
    });
  };

  return (
    <div className={cn("relative inline-block", className)} style={style}>
      <Select
        value={internalValue ? String(internalValue) : undefined}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(sizeStyles[size], "min-w-[180px]")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={dropdownClassName}>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm">加载中...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {notFoundContent}
            </div>
          ) : (
            renderOptions(filteredOptions)
          )}
        </SelectContent>
      </Select>
      {allowClear && internalValue && !disabled && (
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          ✕
        </button>
      )}
    </div>
  );
}
