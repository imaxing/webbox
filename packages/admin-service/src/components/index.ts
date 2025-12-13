// ==================== Common 通用组件（解耦的封装层） ====================
// 这些组件不依赖具体的 UI 框架，业务代码应优先使用这些组件

// 表格组件
export { AntTable } from "./common/AntTable";
export type { AntTableProps, AntTableColumn } from "./common/AntTable";

// 按钮组件
export { AntButton, AntButtonGroup } from "./common/AntButton";
export type { AntButtonProps, AntButtonGroupProps } from "./common/AntButton";

// 选择器组件
export { AntSelect } from "./common/AntSelect";
export type { AntSelectProps, AntSelectOption } from "./common/AntSelect";

// 模态框组件
export { AntModal, Modal } from "./common/AntModal";
export type { AntModalProps } from "./common/AntModal";

// 输入框组件
export { AntInput, AntTextArea } from "./common/AntInput";
export type { AntInputProps, AntTextAreaProps } from "./common/AntInput";

// 标签组件
export { LabelField } from "./common/AntLabel";
export type { LabelFieldProps } from "./common/AntLabel";

// 对话框容器
export { DialogBox } from "./common/AntFormDialog";
export type { DialogBoxProps } from "./common/AntFormDialog";

// 表单字段组件
export { FormField } from "./common/AntFormField";
export type { FormFieldProps } from "./common/AntFormField";

// 通用工具组件
export { default as DataTable } from "./common/DataTable";
export { TableActions } from "./common/TableActions";
export { FormDialog } from "./common/FormDialog";
export type { FormDialogProps } from "./common/FormDialog";

// ==================== Business 业务组件 ====================
// 这些是项目特定的业务组件

// 纯表单组件（用于动态挂载）
export { default as UserForm } from "./business/UserForm";
export { default as RouteForm } from "./business/RouteForm";
export { default as DomainForm } from "./business/DomainForm";
export { default as BaseTemplateForm } from "./business/BaseTemplateForm";
export { default as CustomTemplateForm } from "./business/CustomTemplateForm";
export { default as DomainConfig } from "./business/DomainConfig";
export type { DomainConfigProps } from "./business/DomainConfig";

// 业务视图组件
export { default as DomainMetrics } from "./business/DomainMetrics";
export { default as DomainRelationGraph } from "./business/DomainRelationGraph";
export { DynamicMenu } from "./business/DynamicMenu";
export { DynamicBreadcrumb } from "./business/DynamicBreadcrumb";
export { ThemeToggle } from "./business/ThemeToggle";
export { PageTransition } from "./business/PageTransition";
export { Providers } from "./business/Providers";
export { default as RichTextEditor } from "./business/RichTextEditor";

// 布局组件
export { Breadcrumb } from "./layout/Breadcrumb";

// ==================== UI 基础组件（shadcn/ui 原始组件） ====================
// ⚠️ 仅供 common 层封装使用，业务代码不应直接使用

export { Button } from "./ui/button";
export { Input } from "./ui/input";
export { Textarea } from "./ui/textarea";
export { Label } from "./ui/label";
export { Checkbox } from "./ui/checkbox";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "./ui/select";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./ui/dropdown-menu";
export { Card } from "./ui/card";
export { Badge } from "./ui/badge";
export { Separator } from "./ui/separator";
export { ScrollArea } from "./ui/scroll-area";
export { Collapsible } from "./ui/collapsible";
export { Avatar } from "./ui/avatar";
export { Sheet } from "./ui/sheet";
export { Tooltip } from "./ui/tooltip";
export { Skeleton } from "./ui/skeleton";
