"use client";

import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Button 类型定义
export interface AntButtonProps {
  type?: "primary" | "default" | "dashed" | "text" | "link" | "danger";
  size?: "small" | "medium" | "large";
  htmlType?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  danger?: boolean;
  ghost?: boolean;
  icon?: React.ReactNode;
  shape?: "default" | "circle" | "round";
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export function AntButton({
  type = "default",
  size = "medium",
  htmlType = "button",
  disabled = false,
  loading = false,
  block = false,
  danger = false,
  ghost = false,
  icon,
  shape = "default",
  className,
  style,
  onClick,
  children,
}: AntButtonProps) {
  // 映射 type 到 shadcn variant
  const getVariant = () => {
    if (danger) return "destructive";
    if (type === "primary") return "default";
    if (type === "default") return "outline";
    if (type === "dashed") return "outline";
    if (type === "text" || type === "link") return "ghost";
    return "outline";
  };

  // 映射 size
  const getShadcnSize = () => {
    if (size === "small") return "sm";
    if (size === "large") return "lg";
    return "default";
  };

  // 形状样式
  const shapeStyles = {
    default: "",
    circle: "rounded-full aspect-square p-0",
    round: "rounded-full",
  };

  // 虚线边框样式
  const dashedStyle =
    type === "dashed" ? { borderStyle: "dashed", borderWidth: "1px" } : {};

  // 幽灵按钮样式
  const ghostStyles = ghost
    ? "bg-transparent border-white text-white hover:bg-white/10"
    : "";

  return (
    <ShadcnButton
      type={htmlType}
      variant={getVariant()}
      size={getShadcnSize()}
      disabled={disabled || loading}
      className={cn(
        block && "w-full",
        shapeStyles[shape],
        ghostStyles,
        type === "link" && "underline-offset-4 hover:underline",
        className
      )}
      style={{ ...dashedStyle, ...style }}
      onClick={onClick}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </ShadcnButton>
  );
}

// 按钮组
export interface AntButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function AntButtonGroup({
  children,
  className,
  style,
}: AntButtonGroupProps) {
  return (
    <div
      className={cn("inline-flex rounded-md shadow-sm", className)}
      style={style}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;

        return React.cloneElement(child, {
          className: cn(
            child.props.className,
            !isFirst && "-ml-px",
            !isFirst && !isLast && "rounded-none",
            isFirst && "rounded-r-none",
            isLast && "rounded-l-none"
          ),
        } as any);
      })}
    </div>
  );
}
