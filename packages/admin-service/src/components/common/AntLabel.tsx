"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface LabelFieldProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function LabelField({
  children,
  htmlFor,
  required = false,
  className,
  style,
}: LabelFieldProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium", className)}
      style={style}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}
