"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { useFilteredPeople } from "@/hooks/useSupabase";
import { ErrorDisplay } from "@/components/ui/error-display";
import { DataTable } from "@/components/DataTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { DataFilter } from "@/components/DataFilter";
import { DatePairConfig } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonModal from "@/components/CommonModal";
import { PEOPLE_MODAL_DATA } from "@/components/field-configs/people-modal-data";
import {
  addPersonToSupabase,
  updatePersonToSupabase,
} from "@/hooks/useSupabase";

export interface PeopleFilters {
  name?: string;
  organization?: string;
  department?: string;
  position?: string;
  phone_number?: string;
  vip_level?: string;
  is_worker?: boolean;
  status?: string;
  activity_start_date?: Date;
  activity_end_date?: Date;
  org_dept_pos?: string;
}

// People 데이터 타입 정의
interface People {
  id: string;
  name: string;
  organization: string;
  department: string;
  position: string;
  phone_number: string;
  vip_level: string;
  is_worker: boolean;
  status: string;
  activity_start_date: string;
  activity_end_date: string;
}

// 필터 필드 정의
const FILTER_FIELDS = [
  {
    key: "name",
    label: "이름",
    placeholder: "홍길동",
  },
  {
    key: "organization",
    label: "소속",
    placeholder: "회사명",
  },
  {
    key: "department",
    label: "부서",
    placeholder: "부서명",
  },
  {
    key: "position",
    label: "직책",
    placeholder: "직책명",
  },
  {
    key: "phone_number",
    label: "전화번호",
    placeholder: "숫자만 입력",
  },
  {
    key: "vip_level",
    label: "VIP 레벨",
    placeholder: "VIP 레벨",
    type: "select" as const,
    options: [
      { value: "VIP1", label: "VIP1" },
      { value: "VIP2", label: "VIP2" },
      { value: "VIP3", label: "VIP3" },
      { value: "직원", label: "직원" },
      { value: "대내기관", label: "대내기관" },
      { value: "외부업체", label: "외부업체" },
      { value: "단체방문", label: "단체방문" },
      { value: "none", label: "일반" },
    ],
  },
  {
    key: "is_worker",
    label: "외부용역",
    placeholder: "외부용역 여부",
    type: "select" as const,
    options: [
      { value: true, label: "외부용역" },
      { value: false, label: "외부용역 제외" },
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
    key: "activity_start_date",
    label: "활동 시작일",
    type: "date" as const,
    datePair: {
      startDateField: "activity_start_date",
      endDateField: "activity_end_date",
    } as DatePairConfig,
  },
  {
    key: "activity_end_date",
    label: "활동 종료일",
    type: "date" as const,
    datePair: {
      startDateField: "activity_start_date",
      endDateField: "activity_end_date",
    } as DatePairConfig,
  },
];

// 테이블 컬럼 정의
const TABLE_COLUMNS = [
  {
    key: "name" as keyof People,
    label: "이름",
    defaultValue: "-",
  },
  {
    key: "organization" as keyof People,
    label: "소속",
    defaultValue: "-",
  },
  {
    key: "department" as keyof People,
    label: "부서",
    defaultValue: "-",
  },
  {
    key: "position" as keyof People,
    label: "직책",
    defaultValue: "-",
  },
  {
    key: "phone_number" as keyof People,
    label: "전화번호",
    defaultValue: "-",
  },
  {
    key: "vip_level" as keyof People,
    label: "VIP 레벨",
    defaultValue: "-",
  },
  {
    key: "is_worker" as keyof People,
    label: "외부용역",
    defaultValue: "-",
  },

  {
    key: "activity_start_date" as keyof People,
    label: "활동 시작일",
    defaultValue: "-",
    render: (value: string | undefined) =>
      value ? new Date(value).toLocaleDateString() : "-",
  },
  {
    key: "activity_end_date" as keyof People,
    label: "활동 종료일",
    defaultValue: "-",
    render: (value: string | undefined) =>
      value ? new Date(value).toLocaleDateString() : "-",
  },
  {
    key: "status" as keyof People,
    label: "상태",
    defaultValue: "-",
  },
];

export default function People() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PeopleFilters>({});
  const pageSize = 20;
  const [commonModalOpen, setCommonModalOpen] = useState(false);
  const [commonModalState, setCommonModalState] = useState<
    "READ" | "ADD" | "UPDATE"
  >("READ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 필터가 없으면 모든 데이터를 가져옴
  const {
    data: people,
    loading,
    error,
    count,
    refetch,
  } = useFilteredPeople(filters, currentPage, pageSize);

  const totalPages = count && count > 0 ? Math.ceil(count / pageSize) : 0;

  // 페이지 변경 시 필터 초기화
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색 필터 적용
  const handleSearch = (
    searchFilters: Record<string, string | Date | boolean | undefined>
  ) => {
    setFilters(searchFilters as PeopleFilters);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 행 클릭 핸들러
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (row: any) => {
    setSelectedRecord(row);
    setCommonModalState("READ");
    setCommonModalOpen(true);
  };

  const handleCommonModalClose = () => {
    setCommonModalOpen(false);
    setSelectedRecord(null);
  };

  if (error) {
    console.error("People page error:", error);
    return (
      <>
        <Header title="인물 관리" />
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
      <Header title="인물 관리" />
      <main>
        <div className="relative h-[calc(100vh-var(--header-height)-50px)] overflow-auto">
          <DataTable<People>
            data={people}
            loading={loading}
            currentPage={currentPage}
            columns={TABLE_COLUMNS}
            onRowClick={handleRowClick}
          />
        </div>
        <div className="flex justify-center items-center gap-2 my-auto h-[50px]">
          <Button
            className="bg-[var(--point)] fixed left-4 rounded-full"
            onClick={() => {
              setCommonModalState("ADD");
              setCommonModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <DataFilter
            onSearch={handleSearch}
            fields={FILTER_FIELDS}
            title="인물 검색 옵션"
            description="인물 정보를 검색할 수 있습니다."
          />
        </div>
        <CommonModal
          state={commonModalState}
          open={commonModalOpen}
          onCancel={handleCommonModalClose}
          data={selectedRecord}
          title="인물"
          modalData={PEOPLE_MODAL_DATA}
          isPeopleModal={true}
          onSubmit={async (data) => {
            try {
              if (commonModalState === "ADD") {
                await addPersonToSupabase(data);
                // 성공 시 모달 닫기 및 데이터 새로고침
                handleCommonModalClose();
                refetch();
              } else if (commonModalState === "UPDATE") {
                if (!selectedRecord?.id) {
                  throw new Error("수정할 인물의 ID가 없습니다.");
                }
                await updatePersonToSupabase(selectedRecord.id, data);
                // 성공 시 모달 닫기 및 데이터 새로고침
                handleCommonModalClose();
                refetch();
              }
            } catch (error) {
              console.error("인물 처리 실패:", error);
              const errorMessage =
                error instanceof Error ? error.message : "알 수 없는 오류";
              alert(
                `인물 ${
                  commonModalState === "ADD" ? "추가" : "수정"
                }에 실패했습니다: ${errorMessage}`
              );
            }
          }}
          onModeChange={(mode) => {
            setCommonModalState(mode);
          }}
        />
      </main>
    </>
  );
}
