"use client";

import React from "react";
import { LabelField } from "@/components";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  /** 字段标签 */
  label?: string;
  /** 字段 ID（用于 label 的 htmlFor） */
  name?: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误提示信息 */
  error?: string;
  /** 帮助文本 */
  help?: string;
  /** 字段控件 */
  children: React.ReactNode;
  /** 标签布局方式 */
  layout?: "vertical" | "horizontal";
  /** 标签宽度（horizontal 布局时有效） */
  labelWidth?: number | string;
  /** 容器类名 */
  className?: string;
  /** 标签类名 */
  labelClassName?: string;
  /** 控件容器类名 */
  controlClassName?: string;
}

export function FormField({
  label,
  name,
  required = false,
  error,
  help,
  children,
  layout = "vertical",
  labelWidth = 100,
  className,
  labelClassName,
  controlClassName,
}: FormFieldProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={cn(
        "space-y-2",
        isHorizontal && "flex items-start gap-4",
        className
      )}
    >
      {label && (
        <div
          className={cn(isHorizontal && "pt-2")}
          style={
            isHorizontal ? { width: labelWidth, flexShrink: 0 } : undefined
          }
        >
          <LabelField
            htmlFor={name}
            required={required}
            className={cn("block", labelClassName)}
          >
            {label}
          </LabelField>
        </div>
      )}

      <div className={cn("flex-1", controlClassName)}>
        {children}

        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}

        {!error && help && (
          <p className="mt-1 text-sm text-muted-foreground">{help}</p>
        )}
      </div>
    </div>
  );
}
