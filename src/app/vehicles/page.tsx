"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { useFilteredVehicles, addVehicleToSupabase } from "@/hooks/useSupabase";
import { ErrorDisplay } from "@/components/ui/error-display";
import { DataTable } from "@/components/DataTable";
import { TablePagination } from "@/components/ui/table-pagination";
import { DataFilter } from "@/components/DataFilter";
import { VehicleFilters } from "@/types/filters";
import { DatePairConfig } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonModal from "@/components/CommonModal";
// import { peopleFields } from "@/components/field-configs/people-fields";

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
    defaultValue: false,
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
    defaultValue: false,
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
    defaultValue: "active",
  },
  {
    key: "special_notes",
    label: "비고",
    placeholder: "비고",
  },
  {
    key: "access_start_date",
    label: "접근 시작일",
    type: "date" as const,
    datePair: {
      startDateField: "access_start_date",
      endDateField: "access_end_date",
    } as DatePairConfig,
  },
  {
    key: "access_end_date",
    label: "접근 종료일",
    type: "date" as const,
    datePair: {
      startDateField: "access_start_date",
      endDateField: "access_end_date",
    } as DatePairConfig,
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

// CommonModal용 데이터 구조 정의
const VEHICLE_MODAL_DATA = {
  title: "차량",
  photo: {
    attribute: "photo_path",
    label: "사진",
    placeholder: "사진",
    type: "photo",
    value: "/car.webp",
    defaultValue: "/car.webp",
  },
  fields: [
    {
      attribute: "plate_number",
      label: "차량번호",
      placeholder: "1234가1234",
      type: "text",
      required: true,
      defaultValue: "",
    },
    {
      attribute: "vehicle_type",
      label: "차량종류",
      placeholder: "차량종류",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "is_public_vehicle",
      label: "공용여부",
      placeholder: "공용",
      type: "boolean",
      defaultValue: false,
      dataPair: {
        true: "공용 차량",
        false: "개인 차량",
      },
      required: true,
    },
    {
      attribute: "owner_department",
      label: "부서명",
      placeholder: "부서명",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "access_start_date",
      label: "접근 시작일",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "access_start_date",
        endDateField: "access_end_date",
      },
    },
    {
      attribute: "access_end_date",
      label: "접근 종료일",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "access_start_date",
        endDateField: "access_end_date",
      },
    },
    {
      attribute: "is_free_pass_enabled",
      label: "프리패스",
      type: "boolean",
      defaultValue: false,
      dataPair: {
        true: "프리패스 O",
        false: "프리패스 X",
      },
      required: true,
    },
    {
      attribute: "special_notes",
      label: "특이사항",
      placeholder: "특이사항",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "status",
      label: "상태",
      type: "select",
      defaultValue: "active",
      dataPair: {
        active: "활성",
        inactive: "비활성",
        blocked: "차단",
      },
      required: true,
    },
  ],
};

export default function Vehicles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const pageSize = 20;
  const [commonModalOpen, setCommonModalOpen] = useState(false);
  const [commonModalState, setCommonModalState] = useState<
    "READ" | "ADD" | "UPDATE"
  >("READ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
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

  // 행 클릭 핸들러 (READ 모드로 열기)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (row: any) => {
    setSelectedRecord(row);
    setCommonModalState("READ");
    setCommonModalOpen(true);
  };

  // CommonModal 닫기 핸들러
  const handleCommonModalClose = () => {
    setCommonModalOpen(false);
    setSelectedRecord(null);
  };

  // 추가 버튼 클릭 핸들러
  const handleAddClick = () => {
    setSelectedRecord(null);
    setCommonModalState("ADD");
    setCommonModalOpen(true);
  };

  // CommonModal 제출 핸들러 (추가/수정)
  const handleCommonModalSubmit = async (data: Record<string, unknown>) => {
    try {
      if (commonModalState === "ADD") {
        // 차량 데이터를 Supabase에 저장
        const result = await addVehicleToSupabase(data);

        if (result.error) {
          const errorMessage =
            result.error &&
            typeof result.error === "object" &&
            "message" in result.error
              ? String((result.error as Record<string, unknown>).message)
              : "알 수 없는 오류";
          throw new Error(`데이터 저장 실패: ${errorMessage}`);
        }

        // 성공 시 처리
        setCommonModalOpen(false);
        refetch(); // 차량 데이터 새로고침
      } else if (commonModalState === "UPDATE") {
        // TODO: 수정 기능 구현
        console.log("수정할 차량 데이터:", data);
        // updateVehicleInSupabase(data);
        setCommonModalOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("차량 처리 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(
        `차량 ${
          commonModalState === "ADD" ? "추가" : "수정"
        }에 실패했습니다: ${errorMessage}`
      );
    }
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
            onRowClick={handleRowClick}
          />
        </div>
        <div className="flex justify-center items-center gap-2 my-auto h-[50px]">
          <Button
            className="bg-[var(--point)] fixed left-4 rounded-full"
            onClick={handleAddClick}
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
            title="차량 검색 옵션"
            description="차량 정보를 검색할 수 있습니다."
          />
        </div>
        <CommonModal
          state={commonModalState}
          open={commonModalOpen}
          onCancel={handleCommonModalClose}
          data={selectedRecord}
          title="차량"
          onSubmit={handleCommonModalSubmit}
        />
      </main>
    </>
  );
}
