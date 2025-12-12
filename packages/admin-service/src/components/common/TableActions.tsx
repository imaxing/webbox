"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components";
import { MoreVertical } from "lucide-react";

export interface TableAction {
  text: string;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
  /** 确认提示（如果有，点击时弹出确认框） */
  confirm?: string;
}

export interface TableActionsProps {
  actions: TableAction[];
}

export function TableActions({ actions }: TableActionsProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (action: TableAction) => {
    setOpen(false);

    if (action.confirm) {
      Modal.confirm({
        title: "确认操作",
        content: action.confirm,
        type: action.danger ? "warning" : "confirm",
        onOk: action.onClick,
      });
    } else {
      action.onClick();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action, index) => (
          <div key={index}>
            {action.divider && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => handleClick(action)}
              className={action.danger ? "text-red-600 focus:text-red-600" : ""}
            >
              {action.text}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
