'use client';

import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/dialog';

interface DialogConfig {
  title?: string;
  width?: string;
  children?: ReactNode | ((props: any) => ReactNode);
  footer?: ReactNode | ((props: any) => ReactNode);
}

const DialogWrapper = (
  props: DialogConfig & { visible?: boolean; onUpdate?: any; onClose?: () => void }
) => {
  const { visible = true, title, width, children, footer, onUpdate, onClose } = props;

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(props);
    }
    return children;
  };

  const renderFooter = () => {
    if (typeof footer === 'function') {
      return footer(props);
    }
    return footer;
  };

  const handleClose = () => {
    onUpdate?.({ visible: false });
    onClose?.();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="gap-0 p-0"
        style={width ? { width, maxWidth: '90vw' } : { maxWidth: '700px' }}
        aria-describedby={undefined}
      >
        {title && (
          <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {title}
            </DialogDescription>
          </DialogHeader>
        )}

        <div className="px-6 py-4">{renderChildren()}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {renderFooter()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const createDialog = (config: DialogConfig) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);

  const destroy = () => {
    root.unmount();
    if (div.parentNode) {
      div.parentNode.removeChild(div);
    }
  };

  const onUpdate = (state: { visible: boolean }) => {
    if (!state.visible) {
      setTimeout(destroy, 300); // 延迟销毁以便动画完成
    }
  };

  root.render(<DialogWrapper {...config} onUpdate={onUpdate} onClose={destroy} />);

  return {
    destroy,
  };
};
