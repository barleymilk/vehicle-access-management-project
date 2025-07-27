"use client";

import Header from "@/components/Header";
import { AccessTable } from "@/app/access/_components/AccessTable";
import { SearchFilter } from "@/app/access/_components/SearchFilter";
import { TablePagination } from "@/components/ui/table-pagination";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useAccessRecords } from "@/hooks/useSupabase";
import { useState } from "react";

export default function Access() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const {
    data: accessRecords,
    loading,
    error,
    count,
    refetch,
  } = useAccessRecords(currentPage, pageSize);
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  console.log(accessRecords);

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
            onPageChange={setCurrentPage}
          />
          <SearchFilter />
        </div>
      </main>
    </>
  );
}
