"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Input 组件属性
export interface AntInputProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "small" | "medium" | "large";
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  allowClear?: boolean;
  maxLength?: number;
  showCount?: boolean;
  status?: "error" | "warning";
  className?: string;
  style?: React.CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function AntInput({
  id,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  size = "medium",
  type = "text",
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  allowClear = false,
  maxLength,
  showCount = false,
  status,
  className,
  style,
  onChange,
  onPressEnter,
  onBlur,
  onFocus,
}: AntInputProps) {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue || ""
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    const event = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    setInternalValue("");
    onChange?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onPressEnter?.(e);
    }
  };

  // 尺寸样式
  const sizeStyles = {
    small: "h-8 text-xs",
    medium: "h-10 text-sm",
    large: "h-12 text-base",
  };

  // 状态样式
  const statusStyles = {
    error: "border-red-500 focus-visible:ring-red-500",
    warning: "border-yellow-500 focus-visible:ring-yellow-500",
  };

  const hasAddon = addonBefore || addonAfter;
  const hasAffix = prefix || suffix || allowClear || showCount;

  const inputElement = (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-muted-foreground pointer-events-none">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type={type}
        value={internalValue}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        className={cn(
          sizeStyles[size],
          status && statusStyles[status],
          prefix && "pl-10",
          (suffix || allowClear || showCount) && "pr-10",
          !hasAddon && className
        )}
        style={!hasAddon ? style : undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {(suffix || (allowClear && internalValue) || showCount) && (
        <div className="absolute right-3 flex items-center gap-1 text-muted-foreground">
          {allowClear && internalValue && !disabled && (
            <button
              type="button"
              className="hover:text-foreground cursor-pointer"
              onClick={handleClear}
            >
              ✕
            </button>
          )}
          {showCount && maxLength && (
            <span className="text-xs">
              {internalValue.length}/{maxLength}
            </span>
          )}
          {suffix && <span>{suffix}</span>}
        </div>
      )}
    </div>
  );

  if (!hasAddon) {
    return inputElement;
  }

  return (
    <div className={cn("flex items-stretch", className)} style={style}>
      {addonBefore && (
        <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm rounded-l-md">
          {addonBefore}
        </span>
      )}
      {inputElement}
      {addonAfter && (
        <span className="inline-flex items-center px-3 border border-l-0 border-input bg-muted text-sm rounded-r-md">
          {addonAfter}
        </span>
      )}
    </div>
  );
}

// TextArea 组件
export interface AntTextAreaProps {
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  className?: string;
  style?: React.CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function AntTextArea({
  id,
  value,
  defaultValue,
  placeholder,
  disabled = false,
  readOnly = false,
  rows = 4,
  maxLength,
  showCount = false,
  autoSize = false,
  className,
  style,
  onChange,
}: AntTextAreaProps) {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue || ""
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const minRows = typeof autoSize === "object" ? autoSize.minRows : rows;
  const maxRows = typeof autoSize === "object" ? autoSize.maxRows : undefined;

  return (
    <div className="relative">
      <textarea
        id={id}
        value={internalValue}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={autoSize ? minRows : rows}
        maxLength={maxLength}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          autoSize && "resize-none",
          className
        )}
        style={{
          ...style,
          ...(maxRows && { maxHeight: `${maxRows * 1.5}em` }),
        }}
        onChange={handleChange}
      />
      {showCount && maxLength && (
        <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {internalValue.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
