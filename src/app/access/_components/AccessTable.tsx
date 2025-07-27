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
import { LoadingOverlay } from "@/components/ui/loading";

interface AccessRecord {
  id: string;
  entered_at?: string;
  exited_at?: string;
  purpose?: string;
  raw_plate_number?: string;
  raw_vehicle_type?: string;
  raw_person_name?: string;
  driver_organization?: string;
  raw_person_phone?: string;
  passengers?: string;
  notes?: string;
}

interface AccessTableProps {
  data: AccessRecord[] | null;
  loading: boolean;
  currentPage?: number; // 페이지 변경 감지를 위한 prop
}

export function AccessTable({ data, loading, currentPage }: AccessTableProps) {
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // 페이지가 변경되면 선택된 행 초기화
  useEffect(() => {
    setSelectedRowIndex(null);
  }, [currentPage]);

  const handleRowClick = (index: number) => {
    setSelectedRowIndex(selectedRowIndex === index ? null : index);
  };

  return (
    <LoadingOverlay isLoading={loading} text="출입 기록을 불러오는 중...">
      <Table className="mx-6">
        <TableHeader className="sticky top-0">
          <TableRow className="bg-[var(--point)] hover:bg-muted/50">
            <TableHead className="rounded-tl-lg text-center text-white">
              입장일시
            </TableHead>
            <TableHead className="text-center text-white">퇴장일시</TableHead>
            <TableHead className="text-center text-white">방문목적</TableHead>
            <TableHead className="text-center text-white">차량번호</TableHead>
            <TableHead className="text-center text-white">차량종류</TableHead>
            <TableHead className="text-center text-white">운전자명</TableHead>
            <TableHead className="text-center text-white">운전자소속</TableHead>
            <TableHead className="text-center text-white">운전자번호</TableHead>
            <TableHead className="text-center text-white">동승자</TableHead>
            <TableHead className="rounded-tr-lg text-center text-white">
              특이사항
            </TableHead>
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
                <TableCell>
                  {record.entered_at
                    ? new Date(record.entered_at).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {record.exited_at
                    ? new Date(record.exited_at).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>{record.purpose}</TableCell>
                <TableCell>{record.raw_plate_number || "-"}</TableCell>
                <TableCell>{record.raw_vehicle_type || "-"}</TableCell>
                <TableCell>{record.raw_person_name || "-"}</TableCell>
                <TableCell>{record.driver_organization || "-"}</TableCell>
                <TableCell>{record.raw_person_phone || "-"}</TableCell>
                <TableCell>{record.passengers || "-"}</TableCell>
                <TableCell>{record.notes || "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                {loading ? "데이터를 불러오는 중..." : "출입 기록이 없습니다."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </LoadingOverlay>
  );
}
