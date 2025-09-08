"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { useFilteredAccessRecords } from "@/hooks/useSupabase";
import { ErrorDisplay } from "@/components/ui/error-display";
import { DataTable } from "@/components/DataTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { DataFilter } from "@/components/DataFilter";
import CommonModal from "@/components/CommonModal";
import { ACCESS_MODAL_DATA } from "@/components/field-configs/access-modal-data";
import { DatePairConfig } from "@/lib/utils";

export interface SearchFilters {
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
    key: "name",
    label: "운전자명",
    placeholder: "홍길동",
  },
  {
    key: "org_dept_pos",
    label: "운전자소속",
    placeholder: "부서명",
  },
  {
    key: "phone",
    label: "운전자번호",
    placeholder: "숫자만 입력",
  },
  {
    key: "passengers",
    label: "동승자",
    placeholder: "동승자명",
  },
  {
    key: "purpose",
    label: "방문목적",
    placeholder: "업무/방문",
  },
  {
    key: "notes",
    label: "특이사항",
    placeholder: "특이사항",
  },
  {
    key: "start_date",
    label: "검색 시작일",
    type: "date" as const,
    datePair: {
      startDateField: "start_date",
      endDateField: "end_date",
    } as DatePairConfig,
  },
  {
    key: "end_date",
    label: "검색 종료일",
    type: "date" as const,
    datePair: {
      startDateField: "start_date",
      endDateField: "end_date",
    } as DatePairConfig,
  },
];

// 테이블 컬럼 정의
const TABLE_COLUMNS = [
  {
    key: "entered_at" as const,
    label: "입장일시",
    defaultValue: "-",
    render: (value: string | undefined) =>
      value
        ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
        : "-",
  },
  {
    key: "exited_at" as const,
    label: "퇴장일시",
    defaultValue: "-",
    render: (value: string | undefined) =>
      value
        ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
        : "-",
  },
  {
    key: "purpose" as const,
    label: "방문목적",
    defaultValue: "-",
  },
  {
    key: "raw_plate_number" as const,
    label: "차량번호",
    defaultValue: "-",
  },
  {
    key: "raw_vehicle_type" as const,
    label: "차량종류",
    defaultValue: "-",
  },
  {
    key: "raw_person_name" as const,
    label: "운전자명",
    defaultValue: "-",
  },
  {
    key: "driver_organization" as const,
    label: "운전자소속",
    defaultValue: "-",
  },
  {
    key: "raw_person_phone" as const,
    label: "운전자번호",
    defaultValue: "-",
  },
  {
    key: "passengers" as const,
    label: "동승자",
    defaultValue: "-",
  },
  {
    key: "notes" as const,
    label: "특이사항",
    defaultValue: "-",
  },
];

export default function Access() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const pageSize = 20;
  const [commonModalOpen, setCommonModalOpen] = useState(false);
  const [commonModalState, setCommonModalState] = useState<
    "READ" | "ADD" | "UPDATE"
  >("READ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 필터가 없으면 모든 데이터를 가져옴
  const {
    data: accessRecords,
    loading,
    error,
    count,
    refetch,
  } = useFilteredAccessRecords(filters, currentPage, pageSize);

  const totalPages = count && count > 0 ? Math.ceil(count / pageSize) : 0;

  // 페이지 변경 시 필터 초기화
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 필터 적용
  const handleSearch = (
    searchFilters: Record<string, string | Date | boolean | undefined>
  ) => {
    setFilters(searchFilters as SearchFilters);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 행 클릭 핸들러
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (row: any) => {
    setSelectedRecord(row);
    setCommonModalState("READ");
    setCommonModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCommonModalClose = () => {
    setCommonModalOpen(false);
    setSelectedRecord(null);
  };

  if (error) {
    console.error("Access page error:", error);
    return (
      <>
        <Header title="출입 기록" />
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
      <Header title="출입 기록" />
      <main>
        <div className="relative h-[calc(100vh-var(--header-height)-50px)] overflow-auto">
          <DataTable
            data={accessRecords}
            loading={loading}
            currentPage={currentPage}
            columns={TABLE_COLUMNS}
            onRowClick={handleRowClick}
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
            title="출입 기록 검색 옵션"
            description="출입 기록을 검색할 수 있습니다."
          />
        </div>
        <CommonModal
          state={commonModalState}
          open={commonModalOpen}
          onCancel={handleCommonModalClose}
          data={selectedRecord}
          title="출입 기록"
          modalData={ACCESS_MODAL_DATA}
        />
      </main>
    </>
  );
}
