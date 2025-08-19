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
import DetailModal from "@/components/DetailModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddModal from "@/components/AddModal";
import { vehicleFields } from "@/components/field-configs/vehicle-fields";
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

// DetailModal용 필드 정의
const DETAIL_FIELDS = [
  {
    key: "plate_number",
    label: "차량번호",
  },
  {
    key: "vehicle_type",
    label: "차량종류",
  },
  {
    key: "is_public_vehicle",
    label: "공용여부",
    render: (value: boolean) => (value ? "공용" : "비공용"),
  },
  {
    key: "owner_department",
    label: "소유 부서",
  },
  {
    key: "is_free_pass_enabled",
    label: "프리패스",
    render: (value: boolean) => (value ? "프리패스" : "비프리패스"),
  },
  {
    key: "special_notes",
    label: "비고",
  },
  {
    key: "status",
    label: "상태",
    render: (value: string) => {
      switch (value) {
        case "active":
          return "활성";
        case "inactive":
          return "비활성";
        case "blocked":
          return "차단";
        default:
          return value;
      }
    },
  },
  {
    key: "access_start_date",
    label: "접근 시작일",
    type: "date" as const,
  },
  {
    key: "access_end_date",
    label: "접근 종료일",
    type: "date" as const,
  },
];

export default function Vehicles() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const pageSize = 20;
  const [open, setOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
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

  // 행 클릭 핸들러
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (row: any) => {
    setSelectedRecord(row);
    setOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setOpen(false);
    setSelectedRecord(null);
  };

  // 수정 핸들러
  const handleEdit = () => {
    // TODO: 수정 기능 구현
    // console.log("수정 기능 구현 필요");
  };

  const handleUpdateModalClose = () => {
    setUpdateModalOpen(false);
  };

  const handleAddModalClose = () => {
    setAddModalOpen(false);
  };

  // 차량 데이터 추가 핸들러
  const handleAddSubmit = async (data: Record<string, unknown>) => {
    try {
      // console.log("추가할 차량 데이터:", data);

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

      // console.log("차량 데이터 저장 성공:", result);

      // 성공 시 처리
      setAddModalOpen(false);
      refetch(); // 차량 데이터 새로고침
    } catch (error) {
      console.error("차량 추가 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`차량 추가에 실패했습니다: ${errorMessage}`);
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
            onClick={() => setAddModalOpen(true)}
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
        <AddModal
          open={addModalOpen}
          onCancel={handleAddModalClose}
          fields={vehicleFields}
          title="차량 추가"
          description="차량 정보를 추가할 수 있습니다."
          onSubmit={handleAddSubmit}
        />
        <DetailModal
          open={open}
          onCancel={handleModalClose}
          data={selectedRecord}
          title="차량 상세 정보"
          description="선택된 차량의 상세 정보입니다."
          fields={DETAIL_FIELDS}
          onEdit={handleEdit}
          showEditButton={true}
          showPhoto={true}
          basicPhotoPath="/car.webp"
          photoShape="square"
        />
      </main>
    </>
  );
}
