"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { useFilteredVehicles } from "@/hooks/useSupabase";
import { ErrorDisplay } from "@/components/ui/error-display";
import { DataTable } from "@/components/DataTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { DataFilter } from "@/components/DataFilter";
import { VehicleFilters } from "@/types/filters";

// 필터 필드 정의
const FILTER_FIELDS = [
  {
    key: "plate_number",
    label: "차량번호",
    placeholder: "01가1234 (혹은 기타)",
  },
  {
    key: "vehicle_type",
    label: "차량종류",
    placeholder: "SUV",
  },
  {
    key: "is_public_vehicle",
    label: "공용여부",
    placeholder: "공용/비공용",
    type: "select" as const,
    options: [
      { value: true, label: "공용" },
      { value: false, label: "비공용" },
    ],
  },
  {
    key: "owner_department",
    label: "소유 부서",
    placeholder: "부서명",
  },
  {
    key: "is_free_pass_enabled",
    label: "프리패스",
    placeholder: "프리패스/비프리패스",
    type: "select" as const,
    options: [
      { value: true, label: "프리패스" },
      { value: false, label: "비프리패스" },
    ],
  },
  {
    key: "status",
    label: "상태",
    placeholder: "활성/비활성",
    type: "select" as const,
    options: [
      { value: "active", label: "활성" },
      { value: "inactive", label: "비활성" },
      { value: "blocked", label: "차단" },
    ],
  },
  {
    key: "special_notes",
    label: "비고",
    placeholder: "비고",
  },
  {
    key: "start_date",
    label: "접근 시작일",
    type: "date" as const,
  },
  {
    key: "end_date",
    label: "접근 종료일",
    type: "date" as const,
  },
];

// 테이블 컬럼 정의
const TABLE_COLUMNS = [
  {
    key: "plate_number" as const,
    label: "차량번호",
    defaultValue: "-",
  },
  {
    key: "vehicle_type" as const,
    label: "차량종류",
    defaultValue: "-",
  },
  {
    key: "is_public_vehicle" as const,
    label: "공용여부",
    defaultValue: "-",
    render: (value: boolean) => (value ? "공용" : "-"),
  },
  {
    key: "owner_department" as const,
    label: "공용차량 소유 부서",
    defaultValue: "-",
  },
  {
    key: "is_free_pass_enabled" as const,
    label: "프리패스",
    defaultValue: "-",
    render: (value: boolean) => (value ? "프리패스" : "-"),
  },
  {
    key: "special_notes" as const,
    label: "비고",
    defaultValue: "-",
  },
  {
    key: "status" as const,
    label: "상태",
    defaultValue: "-",
  },
  {
    key: "access_start_date" as const,
    label: "접근 시작일",
    defaultValue: "-",
  },
  {
    key: "access_end_date" as const,
    label: "접근 종료일",
    defaultValue: "-",
  },
];

export default function Vehicles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const pageSize = 20;

  // 필터가 없으면 모든 데이터를 가져옴
  const {
    data: vehicles,
    loading,
    error,
    count,
    refetch,
  } = useFilteredVehicles(filters, currentPage, pageSize);

  const totalPages = count && count > 0 ? Math.ceil(count / pageSize) : 0;

  // 페이지 변경 시 필터 초기화
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 필터 적용
  const handleSearch = (
    searchFilters: Record<string, string | Date | boolean | undefined>
  ) => {
    setFilters(searchFilters as VehicleFilters);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  if (error) {
    console.error("Vehicles page error:", error);
    return (
      <>
        <Header title="차량 관리" />
        <main className="mx-6 pb-24">
          <ErrorDisplay
            message={`데이터를 불러오는 중 오류가 발생했습니다. ${
              error instanceof Error ? error.message : String(error)
            }`}
            onRetry={refetch}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="차량 관리" />
      <main>
        <div className="relative h-[calc(100vh-var(--header-height)-50px)] overflow-auto">
          <DataTable
            data={vehicles}
            loading={loading}
            currentPage={currentPage}
            columns={TABLE_COLUMNS}
          />
        </div>
        <div className="flex justify-center items-center gap-2 my-auto h-[50px]">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <DataFilter
            onSearch={handleSearch}
            fields={FILTER_FIELDS}
            title="차량 검색 옵션"
            description="차량 정보를 검색할 수 있습니다."
          />
        </div>
      </main>
    </>
  );
}
