/**
 * FormDialog 封装组件
 * 统一封装对话框相关组件，便于更换底层组件库
 */

"use client";

import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export interface FormDialogProps {
  /** 是否打开对话框 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 对话框标题 */
  title: string;
  /** 对话框描述（可选） */
  description?: string;
  /** 对话框内容 */
  children: ReactNode;
  /** 对话框底部按钮区域（可选） */
  footer?: ReactNode;
  /** 对话框宽度样式类名 */
  className?: string;
}

/**
 * 统一的表单对话框组件
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="添加用户"
 *   description="请填写用户信息"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>取消</Button>
 *       <Button onClick={handleSubmit}>确认</Button>
 *     </>
 *   }
 * >
 *   {表单内容}
 * </FormDialog>
 * ```
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className = "sm:max-w-[600px]",
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export default FormDialog;
