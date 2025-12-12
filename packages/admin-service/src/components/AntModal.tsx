'use client';

import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog';
import { AntButton } from '@/components/AntButton';
import { cn } from '@/lib/utils';

// Modal 属性类型
export interface AntModalProps {
  open?: boolean;
  title?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode | null;
  width?: number | string;
  centered?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  destroyOnClose?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okButtonProps?: any;
  cancelButtonProps?: any;
  confirmLoading?: boolean;
  children?: React.ReactNode;
}

// Modal 组件（声明式）
export function AntModal({
  open = false,
  title,
  content,
  footer,
  width = 520,
  centered = true,
  maskClosable = true,
  closable = true,
  destroyOnClose = false,
  className,
  style,
  onOk,
  onCancel,
  okText = '确定',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  confirmLoading = false,
  children,
}: AntModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleOk = async () => {
    if (onOk) {
      setLoading(true);
      try {
        await onOk();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && onCancel) {
      onCancel();
    }
  };

  const renderFooter = () => {
    if (footer === null) return null;
    if (footer) return footer;

    return (
      <DialogFooter>
        <AntButton {...cancelButtonProps} onClick={onCancel}>
          {cancelText}
        </AntButton>
        <AntButton
          type="primary"
          loading={loading || confirmLoading}
          {...okButtonProps}
          onClick={handleOk}
        >
          {okText}
        </AntButton>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn('max-w-lg', className)}
        style={{ width, ...style }}
        onInteractOutside={(e) => {
          if (!maskClosable) {
            e.preventDefault();
          }
        }}
      >
        {(title || closable) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
          </DialogHeader>
        )}
        {(content || children) && (
          <DialogDescription asChild>
            <div className="text-foreground">{content || children}</div>
          </DialogDescription>
        )}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}

// 确认对话框配置
interface ModalConfirmProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  okButtonProps?: any;
  cancelButtonProps?: any;
  width?: number;
  centered?: boolean;
  icon?: React.ReactNode;
}

// 命令式调用的内部组件
function ModalConfirmInternal({
  title,
  content,
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  type = 'confirm',
  okButtonProps,
  cancelButtonProps,
  width = 416,
  centered = true,
  icon,
}: ModalConfirmProps & { onClose: () => void }) {
  const [open, setOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const handleOk = async () => {
    if (onOk) {
      setLoading(true);
      try {
        await onOk();
        setOpen(false);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    const icons = {
      info: <span className="text-blue-500 text-2xl">ℹ️</span>,
      success: <span className="text-green-500 text-2xl">✓</span>,
      warning: <span className="text-yellow-500 text-2xl">⚠️</span>,
      error: <span className="text-red-500 text-2xl">✕</span>,
      confirm: <span className="text-yellow-500 text-2xl">?</span>,
    };
    return icons[type];
  };

  const getOkButtonType = () => {
    if (type === 'error' || type === 'warning') return 'danger';
    return 'primary';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-md" style={{ width }}>
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            {getIcon()}
            <span>{title || '提示'}</span>
          </DialogTitle>
        </DialogHeader>
        {content && (
          <DialogDescription asChild>
            <div className="text-foreground pl-11">{content}</div>
          </DialogDescription>
        )}
        <DialogFooter>
          {type === 'confirm' && (
            <AntButton {...cancelButtonProps} onClick={handleCancel}>
              {cancelText}
            </AntButton>
          )}
          <AntButton
            type={getOkButtonType() as any}
            loading={loading}
            {...okButtonProps}
            onClick={handleOk}
          >
            {okText}
          </AntButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 命令式调用方法
function createConfirm(config: ModalConfirmProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);

  const destroy = () => {
    root.unmount();
    if (div.parentNode) {
      div.parentNode.removeChild(div);
    }
  };

  root.render(<ModalConfirmInternal {...config} onClose={destroy} />);

  return {
    destroy,
  };
}

// 导出命令式 API
export const Modal = {
  confirm: (config: ModalConfirmProps) => createConfirm({ ...config, type: 'confirm' }),
  info: (config: ModalConfirmProps) => createConfirm({ ...config, type: 'info' }),
  success: (config: ModalConfirmProps) => createConfirm({ ...config, type: 'success' }),
  warning: (config: ModalConfirmProps) => createConfirm({ ...config, type: 'warning' }),
  error: (config: ModalConfirmProps) => createConfirm({ ...config, type: 'error' }),
};
