"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ColumnDefinition<T> {
  key: keyof T;
  label: string;
  defaultValue: string;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[] | null;
  loading: boolean;
  currentPage?: number;
  columns: ColumnDefinition<T>[];
}

export function DataTable<T extends { id: string }>({
  data,
  loading,
  currentPage,
  columns,
}: DataTableProps<T>) {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // 페이지가 변경되면 선택된 행 초기화 및 테이블 내부 스크롤
  useEffect(() => {
    setSelectedRowIndex(null);

    // 부모 컨테이너에서 overflow-auto 클래스를 가진 요소를 찾아서 스크롤
    const scrollContainer = document.querySelector(".overflow-auto");
    if (scrollContainer && scrollContainer instanceof HTMLElement) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleRowClick = (index: number) => {
    setSelectedRowIndex(selectedRowIndex === index ? null : index);
  };

  const renderCell = (record: T, column: ColumnDefinition<T>) => {
    if (column.render) {
      return column.render(record[column.key], record);
    }

    const value = record[column.key];
    return value ? String(value) : column.defaultValue;
  };

  return (
    <Table className="mx-6">
      <TableHeader className="sticky top-0">
        <TableRow className="bg-[var(--point)] hover:bg-muted/50">
          {columns.map((column, index) => (
            <TableHead
              key={column.key as string}
              className={`text-center text-white ${
                index === 0 ? "rounded-tl-lg" : ""
              } ${index === columns.length - 1 ? "rounded-tr-lg" : ""}`}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data && data.length > 0 ? (
          data.map((record, index) => (
            <TableRow
              key={record.id}
              className={`cursor-pointer hover:bg-muted/50 ${
                selectedRowIndex === index ? "bg-muted" : ""
              }`}
              onClick={() => handleRowClick(index)}
            >
              {columns.map((column) => (
                <TableCell key={`${record.id}-${column.key as string}`}>
                  {renderCell(record, column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              {loading ? "데이터를 불러오는 중..." : "데이터가 없습니다."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
