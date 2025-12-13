"use client";

import React from "react";
import {
  StatusBadge,
  type StatusBadgeProps,
  type StatusVariant,
} from "@/components/common/StatusBadge";

export interface EnumBadgeItem {
  text: string;
  variant?: StatusVariant;
  customColor?: StatusBadgeProps["customColor"];
}

export interface EnumBadgeProps {
  value: string;
  items: Record<string, EnumBadgeItem>;
  fallbackText?: string;
  fallbackVariant?: StatusVariant;
  className?: string;
}

/**
 * EnumBadge - 枚举状态展示（业务层传入 text / 颜色配置）
 */
export function EnumBadge({
  value,
  items,
  fallbackText,
  fallbackVariant = "gray",
  className,
}: EnumBadgeProps) {
  const item = items[value];
  const text = item?.text ?? fallbackText ?? value;
  const variant = item?.variant ?? fallbackVariant;

  return (
    <StatusBadge
      text={text}
      variant={variant}
      customColor={item?.customColor}
      className={className}
    />
  );
}
