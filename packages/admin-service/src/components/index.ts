// Ant Design 风格的组件封装
export { AntTable } from './AntTable';
export type { AntTableProps, AntTableColumn } from './AntTable';

export { AntButton, AntButtonGroup } from './AntButton';
export type { AntButtonProps, AntButtonGroupProps } from './AntButton';

export { AntSelect } from './AntSelect';
export type { AntSelectProps, AntSelectOption } from './AntSelect';

export { AntModal, Modal } from './AntModal';
export type { AntModalProps } from './AntModal';

export { AntInput, AntTextArea } from './AntInput';
export type { AntInputProps, AntTextAreaProps } from './AntInput';

export { DynamicMenu } from './DynamicMenu';

// 业务组件导出
export { default as DomainConfigDialog } from './DomainConfigDialog';
export type { DomainConfigDialogProps } from './DomainConfigDialog';

// 原始 shadcn/ui 组件（按需导出）
export { Button } from './button';
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';
export { Checkbox } from './checkbox';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from './select';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
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
} from './dropdown-menu';
