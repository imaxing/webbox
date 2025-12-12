/** @jsxImportSource react */
import React from "react";
import createDynamicMount from "react-dynamic-mount";
import { DialogBox, type DialogBoxProps, AntButton } from "@/components";

/**
 * 按钮配置
 */
export interface DialogButton {
  /** 按钮文本 */
  text: string;
  /** 回调方法名（组件内部方法） */
  callback: string;
  /** 按钮类型 */
  type?: "primary" | "default" | "danger";
  /** 是否加载状态 */
  loading?: boolean;
}

/**
 * 动态对话框属性
 */
interface DynamicDialogProps
  extends Omit<
    DialogBoxProps,
    "open" | "onOpenChange" | "children" | "footer"
  > {
  /** 对话框内容（JSX） */
  component?: React.ReactNode;
  /** 对话框内容（children 别名） */
  children?: React.ReactNode;
  /** 按钮配置（业务按钮） */
  buttons?: DialogButton[];
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 是否可见（由 react-dynamic-mount 控制） */
  visible?: boolean;
  /** 关闭回调 */
  onUpdate?: (props: any) => void;
  /** 容器元素 */
  containerEl?: HTMLElement;
}

/**
 * 动态对话框包装组件
 */
function DialogWrapper(props: DynamicDialogProps) {
  const {
    onUpdate,
    component,
    children,
    visible = true,
    buttons = [],
    showCancel = true,
    cancelText = "取消",
    ...rest
  } = props;
  const componentRef = React.useRef<any>(null);
  const [loadingStates, setLoadingStates] = React.useState<
    Record<string, boolean>
  >({});

  const handleClose = () => {
    onUpdate?.({ visible: false });
  };

  // 处理按钮点击
  const handleButtonClick = async (button: DialogButton) => {
    if (!componentRef.current) return;

    const method = componentRef.current[button.callback];
    if (typeof method === "function") {
      setLoadingStates((prev) => ({ ...prev, [button.callback]: true }));
      try {
        await method();
      } finally {
        setLoadingStates((prev) => ({ ...prev, [button.callback]: false }));
      }
    }
  };

  // 渲染 footer 按钮
  const renderFooter = () => {
    const hasButtons = buttons.length > 0 || showCancel;
    if (!hasButtons) return null;

    return (
      <div className="flex justify-end gap-3">
        {/* 取消按钮（内置） */}
        {showCancel && (
          <AntButton type="default" onClick={handleClose}>
            {cancelText}
          </AntButton>
        )}

        {/* 业务按钮 */}
        {buttons.map((button, index) => (
          <AntButton
            key={index}
            type={button.type || "default"}
            onClick={() => handleButtonClick(button)}
            loading={loadingStates[button.callback]}
          >
            {button.text}
          </AntButton>
        ))}
      </div>
    );
  };

  // 增强组件：注入 onClose 和 ref
  const enhancedComponent = React.useMemo(() => {
    if (!React.isValidElement(component)) {
      return component || children;
    }

    return React.cloneElement(component as React.ReactElement<any>, {
      ref: componentRef,
      onClose: handleClose,
    });
  }, [component, children]);

  return (
    <DialogBox
      {...rest}
      open={visible}
      footer={renderFooter()}
      showOkButton={false}
      showCancelButton={false}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      {enhancedComponent}
    </DialogBox>
  );
}

/**
 * 创建动态对话框
 *
 * @example
 * createDialog({
 *   title: '编辑用户',
 *   width: 600,
 *   component: (
 *     <UserForm
 *       initialData={user}
 *       onSubmit={async (data) => {
 *         await updateUser(data);
 *         toast.success('更新成功');
 *       }}
 *     />
 *   ),
 *   buttons: [
 *     { text: '确定', callback: 'submit', type: 'primary' }
 *   ],
 *   // showCancel: true,  // 默认显示取消按钮
 *   // cancelText: '取消', // 可自定义取消按钮文本
 * });
 */
export const createDialog = createDynamicMount<DynamicDialogProps>({
  extend: DialogWrapper,
});
