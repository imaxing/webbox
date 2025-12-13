"use client";

import React from "react";
import { cn } from "@/lib/utils";

// 预定义的颜色变体
export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"
  | "purple"
  | "blue"
  | "gray";

// StatusBadge 组件属性
export interface StatusBadgeProps {
  /** 显示的文本 */
  text: string;
  /** 颜色变体 */
  variant?: StatusVariant;
  /** 自定义类名 */
  className?: string;
  /** 自定义颜色配置 */
  customColor?: {
    bg: string;
    text: string;
    darkBg?: string;
    darkText?: string;
  };
}

// 预定义的颜色方案
const variantStyles: Record<StatusVariant, string> = {
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

/**
 * StatusBadge - 通用状态徽章组件
 *
 * @example
 * // 使用预定义变体
 * <StatusBadge text="激活" variant="success" />
 * <StatusBadge text="禁用" variant="error" />
 *
 * // 使用自定义颜色
 * <StatusBadge
 *   text="自定义"
 *   customColor={{
 *     bg: "bg-orange-100",
 *     text: "text-orange-800",
 *     darkBg: "dark:bg-orange-900/30",
 *     darkText: "dark:text-orange-400"
 *   }}
 * />
 */
export function StatusBadge({
  text,
  variant = "default",
  className,
  customColor,
}: StatusBadgeProps) {
  // 如果提供了自定义颜色，使用自定义颜色
  const colorClasses = customColor
    ? cn(customColor.bg, customColor.text, customColor.darkBg, customColor.darkText)
    : variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses,
        className
      )}
    >
      {text}
    </span>
  );
}
