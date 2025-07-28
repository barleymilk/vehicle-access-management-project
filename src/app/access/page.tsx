"use client";

import Header from "@/components/Header";
import { AccessTable } from "@/app/access/_components/AccessTable";
import { SearchFilter } from "@/app/access/_components/SearchFilter";
import { TablePagination } from "@/components/ui/table-pagination";
import { ErrorDisplay } from "@/components/ui/error-display";
import {
  useAccessRecords,
  useFilteredAccessRecords,
} from "@/hooks/useSupabase";
import { useState } from "react";

interface SearchFilters {
  plate_number?: string;
  vehicle_type?: string;
  name?: string;
  org_dept_pos?: string;
  phone?: string;
  passengers?: string;
  purpose?: string;
  notes?: string;
  start_date?: Date;
  end_date?: Date;
}

export default function Access() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const pageSize = 20;

  // 필터가 있는지 확인
  const hasFilters = filters && Object.keys(filters).length > 0;

  // 항상 두 훅을 모두 호출 (React Hook 규칙 준수)
  const {
    data: allRecords,
    loading: allLoading,
    error: allError,
    count: allCount,
    refetch: allRefetch,
  } = useAccessRecords(currentPage, pageSize);

  const {
    data: filteredRecords,
    loading: filteredLoading,
    error: filteredError,
    count: filteredCount,
    refetch: filteredRefetch,
  } = useFilteredAccessRecords(filters, currentPage, pageSize);

  // 필터 상태에 따라 적절한 데이터 선택
  const accessRecords = hasFilters ? filteredRecords : allRecords;
  const loading = hasFilters ? filteredLoading : allLoading;
  const error = hasFilters ? filteredError : allError;
  const count = hasFilters ? filteredCount : allCount;
  const refetch = hasFilters ? filteredRefetch : allRefetch;

  const totalPages = count && count > 0 ? Math.ceil(count / pageSize) : 0;

  // 디버깅: count 값 확인
  // console.log("Debug - Count values:", {
  //   allCount,
  //   filteredCount,
  //   selectedCount: count,
  //   totalPages,
  //   hasFilters,
  //   currentPage,
  //   pageSize,
  //   accessRecordsLength: accessRecords?.length || 0,
  // });

  // 페이지 변경 시 필터 초기화
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 필터 적용
  const handleSearch = (searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  if (error) {
    return (
      <>
        <Header title="출입 기록" />
        <main className="mx-6 pb-24">
          <ErrorDisplay
            message="데이터를 불러오는 중 오류가 발생했습니다."
            onRetry={refetch}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="출입 기록" />
      <main>
        <div className="relative h-[calc(100vh-var(--header-height)-50px)] overflow-auto">
          <AccessTable
            data={accessRecords}
            loading={loading}
            currentPage={currentPage}
          />
        </div>
        <div className="flex justify-center items-center gap-2 my-auto h-[50px]">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <SearchFilter onSearch={handleSearch} />
        </div>
      </main>
    </>
  );
}
