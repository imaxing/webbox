"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 列定义类型
export interface AntTableColumn<T = any> {
  title: string;
  dataIndex?: keyof T | string;
  key?: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: { text: string; value: any }[];
  onFilter?: (value: any, record: T) => boolean;
  ellipsis?: boolean;
  className?: string;
}

// 表格属性类型
export interface AntTableProps<T = any> {
  columns: AntTableColumn<T>[];
  dataSource?: T[];
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  bordered?: boolean;
  size?: "small" | "medium" | "large";
  pagination?:
    | {
        current?: number;
        pageSize?: number;
        total?: number;
        showSizeChanger?: boolean;
        showQuickJumper?: boolean;
        onChange?: (page: number, pageSize: number) => void;
      }
    | false;
  rowSelection?: {
    type?: "checkbox" | "radio";
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  scroll?: { x?: number | string; y?: number | string };
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRow?: (
    record: T,
    index: number
  ) => React.HTMLAttributes<HTMLTableRowElement>;
  locale?: {
    emptyText?: React.ReactNode;
  };
}

export function AntTable<T extends Record<string, any>>({
  columns,
  dataSource = [],
  rowKey = "id",
  loading = false,
  bordered = false,
  size = "medium",
  pagination,
  rowSelection,
  onChange,
  scroll,
  className,
  rowClassName,
  onRow,
  locale = { emptyText: "暂无数据" },
}: AntTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = React.useState<React.Key[]>(
    rowSelection?.selectedRowKeys || []
  );
  const [sortState, setSortState] = React.useState<{
    column?: string;
    order?: "asc" | "desc";
  }>({});

  // 获取行的唯一 key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    const keys = checked
      ? dataSource.map((record, idx) => getRowKey(record, idx))
      : [];
    setSelectedKeys(keys);
    rowSelection?.onChange?.(keys, checked ? dataSource : []);
  };

  // 处理单选
  const handleSelectRow = (record: T, index: number, checked: boolean) => {
    const key = getRowKey(record, index);
    const newKeys = checked
      ? [...selectedKeys, key]
      : selectedKeys.filter((k) => k !== key);
    setSelectedKeys(newKeys);
    const selectedRows = dataSource.filter((r, i) =>
      newKeys.includes(getRowKey(r, i))
    );
    rowSelection?.onChange?.(newKeys, selectedRows);
  };

  // 处理排序
  const handleSort = (column: AntTableColumn<T>) => {
    if (!column.sorter) return;

    let order: "asc" | "desc" | undefined = "asc";
    if (sortState.column === column.key && sortState.order === "asc") {
      order = "desc";
    } else if (sortState.column === column.key && sortState.order === "desc") {
      order = undefined;
    }

    setSortState({ column: column.key, order });
    onChange?.(pagination, {}, { column, order });
  };

  // 获取单元格值
  const getCellValue = (record: T, column: AntTableColumn<T>) => {
    if (!column.dataIndex) return null;
    const keys = String(column.dataIndex).split(".");
    let value: any = record;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  };

  // 表格尺寸样式
  const sizeStyles = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const cellPadding = {
    small: "px-2 py-1",
    medium: "px-4 py-2",
    large: "px-6 py-3",
  };

  const isAllSelected =
    dataSource.length > 0 && selectedKeys.length === dataSource.length;
  const isSomeSelected = selectedKeys.length > 0 && !isAllSelected;

  return (
    <div
      className={cn(
        "w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden",
        className
      )}
    >
      <div
        className={cn("relative overflow-auto", scroll?.y && "max-h-[600px]")}
      >
        <Table className={cn(sizeStyles[size], bordered && "border")}>
          <TableHeader className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r z-10">
            <TableRow>
              {rowSelection && (
                <TableHead className={cn("w-12", cellPadding[size])}>
                  {rowSelection.type !== "radio" && (
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="全选"
                      className={
                        isSomeSelected ? "data-[state=checked]:bg-primary" : ""
                      }
                    />
                  )}
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead
                  key={column.key || String(column.dataIndex) || index}
                  className={cn(
                    cellPadding[size],
                    column.align && `text-${column.align}`,
                    column.sorter && "cursor-pointer select-none",
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sorter && handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sorter && sortState.column === column.key && (
                      <span className="text-primary">
                        {sortState.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : dataSource.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {locale.emptyText}
                </TableCell>
              </TableRow>
            ) : (
              dataSource.map((record, rowIndex) => {
                const key = getRowKey(record, rowIndex);
                const isSelected = selectedKeys.includes(key);
                const rowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(record, rowIndex)
                    : rowClassName;
                const rowProps = onRow?.(record, rowIndex);

                return (
                  <TableRow
                    key={key}
                    className={cn(
                      isSelected && "bg-muted/50",
                      "hover:bg-muted/30 transition-colors",
                      rowClass
                    )}
                    {...rowProps}
                  >
                    {rowSelection && (
                      <TableCell className={cellPadding[size]}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(
                              record,
                              rowIndex,
                              checked as boolean
                            )
                          }
                          disabled={
                            rowSelection.getCheckboxProps?.(record)?.disabled
                          }
                          aria-label={`选择第 ${rowIndex + 1} 行`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column, colIndex) => {
                      const value = getCellValue(record, column);
                      const content = column.render
                        ? column.render(value, record, rowIndex)
                        : value;

                      return (
                        <TableCell
                          key={
                            column.key || String(column.dataIndex) || colIndex
                          }
                          className={cn(
                            cellPadding[size],
                            column.align && `text-${column.align}`,
                            column.ellipsis && "truncate max-w-xs",
                            column.className
                          )}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页器 */}
      {pagination !== false && pagination && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            共 {pagination.total || 0} 条
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() =>
                pagination.onChange?.(
                  pagination.current! - 1,
                  pagination.pageSize!
                )
              }
            >
              上一页
            </Button>
            <span className="text-sm">
              第 {pagination.current} /{" "}
              {Math.ceil((pagination.total || 0) / (pagination.pageSize || 10))}{" "}
              页
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.current ===
                Math.ceil((pagination.total || 0) / (pagination.pageSize || 10))
              }
              onClick={() =>
                pagination.onChange?.(
                  pagination.current! + 1,
                  pagination.pageSize!
                )
              }
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
