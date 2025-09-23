import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronDownIcon, FolderSearch2, Trash, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleDatePairChange, DatePairConfig } from "@/lib/utils";
import { ModalData, Driver } from "@/types";
import { getPhotoPath, uploadImageToSupabase } from "@/hooks/useSupabase";
import PersonSearchInput from "./PersonSearchInput";

// mode 상태를 통해 읽기, 추가, 업데이트 기능이 각각 가능하게 함
// READ: 수정 버튼, 삭제 버튼, 닫기 버튼
// ADD: 초기화 버튼, 추가 버튼, 닫기 버튼
// UPDATE: 초기화 버튼, 저장 버튼, 닫기 버튼

interface CommonModalProps {
  state: "READ" | "ADD" | "UPDATE";
  open: boolean;
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; // 실제 데이터
  title?: string; // 모달 제목
  modalData: ModalData; // 모달 필드 구성 데이터
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit?: (data: any) => void; // 저장/추가/수정 시 호출
  onModeChange?: (mode: "READ" | "ADD" | "UPDATE") => void; // 모드 변경 시 호출
  disableEdit?: boolean; // 수정 기능 비활성화
}

export default function CommonModal({
  state,
  open,
  onCancel,
  data,
  title = "데이터",
  modalData,
  onSubmit,
  onModeChange,
  disableEdit = false,
}: CommonModalProps) {
  const [mode, setMode] = useState<"READ" | "ADD" | "UPDATE">(state); // mode: READ, ADD, UPDATE
  const dialogContentRef = useRef<HTMLDivElement>(null);
  console.log("data", data);

  // state prop이 변경될 때 mode 업데이트
  useEffect(() => {
    setMode(state);
  }, [state]);

  // 모드가 변경될 때 스크롤을 최상단으로 이동하고 부모 컴포넌트에 알림
  useEffect(() => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0;
    }
    // 부모 컴포넌트에 모드 변경 알림
    if (onModeChange) {
      onModeChange(mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  // 초기 데이터를 별도로 저장 (초기화 시 사용)
  const [initialFormData] = useState(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialData: Record<string, any> = {};

    // 사진 데이터 추가
    if (modalData.photo) {
      if (mode === "ADD") {
        // ADD 모드: defaultValue만 사용
        initialData[modalData.photo.attribute] = modalData.photo.defaultValue;
      } else {
        // READ/UPDATE 모드: 실제 데이터 또는 defaultValue 사용
        initialData[modalData.photo.attribute] =
          data?.[modalData.photo.attribute] || modalData.photo.defaultValue;
      }
    }

    // 일반 필드 데이터 추가
    modalData.fields.forEach((item) => {
      if (mode === "ADD") {
        // ADD 모드: defaultValue만 사용
        initialData[item.attribute] = item.defaultValue;
      } else {
        // READ/UPDATE 모드: 실제 데이터 또는 defaultValue 사용
        let value = data?.[item.attribute] || item.defaultValue;

        // 날짜 필드인 경우 Date 객체로 변환
        if (item.type === "date" && value && typeof value === "string") {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            value = date;
          }
        }

        initialData[item.attribute] = value;
      }
    });

    return initialData;
  });
  const [formData, setFormData] = useState(initialFormData);
  const [openDatePopover, setOpenDatePopover] = useState<string | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
  const [associatedDrivers, setAssociatedDrivers] = useState<Driver[]>([]);
  const [driversToDelete, setDriversToDelete] = useState<Driver[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // 연관된 운전자 데이터 가져오기
  const fetchAssociatedDrivers = async (vehicleId: string) => {
    try {
      const { getVehicleDrivers } = await import("@/hooks/useSupabase");
      const result = await getVehicleDrivers(vehicleId);

      if (result.error) {
        console.error("운전자 데이터 가져오기 실패:", result.error);
        setAssociatedDrivers([]);
      } else {
        setAssociatedDrivers(result.data || []);
      }
    } catch (error) {
      console.error("운전자 데이터 가져오기 오류:", error);
      setAssociatedDrivers([]);
    }
  };

  // 데이터가 변경될 때 formData와 initialFormData 업데이트
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newFormData: Record<string, any> = {};

    // 사진 데이터 추가
    if (modalData.photo) {
      if (mode === "ADD") {
        newFormData[modalData.photo.attribute] = modalData.photo.defaultValue;
      } else {
        newFormData[modalData.photo.attribute] =
          data?.[modalData.photo.attribute] || modalData.photo.defaultValue;
      }
    }

    // 일반 필드 데이터 추가
    modalData.fields.forEach((item) => {
      if (mode === "ADD") {
        newFormData[item.attribute] = item.defaultValue;
      } else {
        let value = data?.[item.attribute] || item.defaultValue;

        // 날짜 필드인 경우 Date 객체로 변환
        if (item.type === "date" && value && typeof value === "string") {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            value = date;
          }
        }

        newFormData[item.attribute] = value;
      }
    });

    setFormData(newFormData);

    // 차량 데이터가 있고 READ/UPDATE 모드일 때 연관된 운전자 데이터 가져오기
    if (data?.id && (mode === "READ" || mode === "UPDATE")) {
      fetchAssociatedDrivers(data.id);
    } else {
      setAssociatedDrivers([]);
    }
  }, [data, mode, modalData.fields, modalData.photo]);

  // autoGenerate 처리
  useEffect(() => {
    const newFormData = { ...formData };
    let hasChanges = false;

    modalData.fields.forEach((field) => {
      if (field.autoGenerate) {
        const generatedValue = field.autoGenerate(formData);
        if (
          generatedValue !== undefined &&
          generatedValue !== formData[field.attribute]
        ) {
          newFormData[field.attribute] = generatedValue;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setFormData(newFormData);
    }
  }, [formData, modalData.fields]);

  const handleDateChange = (field: string, value: unknown) => {
    let processedValue = value;

    // 필드 타입에 따른 처리
    const fieldConfig = modalData.fields.find((f) => f.attribute === field);
    if (fieldConfig?.type === "date") {
      processedValue =
        value && typeof value === "string" ? new Date(value) : value;
    }

    setFormData((prev) => {
      const newFormData = { ...prev, [field]: processedValue };

      // 날짜 필드 간 연동 로직 (공통 함수 사용)
      if (fieldConfig?.type === "date" && fieldConfig.datePair) {
        const newFormDataWithDatePair = handleDatePairChange(
          field,
          processedValue instanceof Date ? processedValue : undefined,
          newFormData,
          fieldConfig.datePair as DatePairConfig
        );
        return newFormDataWithDatePair;
      }

      return newFormData;
    });

    // 날짜 필드 선택 시 팝업 자동 닫기
    if (fieldConfig?.type === "date") {
      setOpenDatePopover(null);
    }
  };

  // 운전자 선택 핸들러
  const handleSelectDriver = (driver: Driver) => {
    setSelectedDrivers((prev) => {
      // 이미 선택된 운전자인지 확인
      const isAlreadySelected = prev.some((d) => d.id === driver.id);
      if (isAlreadySelected) {
        return prev;
      }

      // 이미 등록된 운전자인지 확인
      const isAlreadyRegistered = associatedDrivers.some(
        (d) => d.id === driver.id
      );
      if (isAlreadyRegistered) {
        alert("이미 등록된 운전자입니다.");
        return prev;
      }

      return [...prev, driver];
    });
  };

  // 운전자 제거 핸들러 (선택된 운전자에서 제거)
  const handleRemoveDriver = (driverId: string) => {
    setSelectedDrivers((prev) => prev.filter((d) => d.id !== driverId));
  };

  // 등록된 운전자 삭제 확인 핸들러
  const handleDeleteDriverClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  // 운전자를 삭제 목록에 추가
  const handleAddToDeleteList = () => {
    if (!driverToDelete) return;

    setDriversToDelete((prev) => {
      // 이미 삭제 목록에 있는지 확인
      const isAlreadyInList = prev.some((d) => d.id === driverToDelete.id);
      if (isAlreadyInList) {
        return prev;
      }
      return [...prev, driverToDelete];
    });

    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  // 삭제 목록에서 운전자 제거
  const handleRemoveFromDeleteList = (driverId: string) => {
    setDriversToDelete((prev) => prev.filter((d) => d.id !== driverId));
  };

  // 삭제 확인 모달 닫기
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  // 모달 닫기 핸들러 (UPDATE 모드에서는 READ 모드로 복귀)
  const handleCancel = () => {
    if (mode === "UPDATE") {
      setMode("READ");
    } else {
      onCancel();
    }
    // 모달 닫을 때 selectedDrivers와 driversToDelete 초기화
    setSelectedDrivers([]);
    setDriversToDelete([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent
        ref={dialogContentRef}
        className="max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {title}{" "}
            {mode === "READ" ? "정보" : mode === "ADD" ? "추가" : "수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 필드 섹션 */}
          <Tabs defaultValue="vehicle">
            <TabsList>
              <TabsTrigger value="vehicle">차량</TabsTrigger>
              <TabsTrigger value="people">운전자</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicle" className="grid gap-4 py-4">
              {/* 사진 섹션 */}
              {modalData.photo && (
                <Photo
                  mode={mode}
                  formData={formData}
                  setFormData={setFormData}
                  modalData={modalData}
                />
              )}
              {modalData.fields.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <Label className="w-22 flex-shrink-0 text-sm font-semibold">
                    {item.label} {item.required && "*"}
                  </Label>
                  {/* item.type의 값에 따라 다르게 렌더링: text, boolean(select 타입의 일종), select, date */}
                  {item.type === "text" &&
                    (mode === "READ" ? (
                      <div className="flex-1 rounded-[20px] text-sm bg-gray-100 px-3 py-2">
                        {formData[item.attribute] || "-"}
                      </div>
                    ) : (
                      <Input
                        className="flex-1 rounded-[20px] text-sm placeholder:text-gray-400"
                        placeholder={item.placeholder}
                        value={formData[item.attribute] || ""}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            [item.attribute]: e.target.value,
                          }));
                        }}
                      />
                    ))}
                  {item.type === "boolean" &&
                    item.dataPair &&
                    (mode === "READ" ? (
                      <div className="flex-1 rounded-[20px] text-sm bg-gray-100 px-3 py-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(item.dataPair as any)[
                          formData[item.attribute]?.toString()
                        ] || "-"}
                      </div>
                    ) : (
                      <Select
                        value={formData[item.attribute]?.toString()}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            [item.attribute]: value === "true",
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full rounded-[20px]">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(item.dataPair).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.toString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  {item.type === "select" &&
                    item.dataPair &&
                    (mode === "READ" ? (
                      <div className="flex-1 rounded-[20px] text-sm bg-gray-100 px-3 py-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(item.dataPair as any)[
                          formData[item.attribute]?.toString()
                        ] || "-"}
                      </div>
                    ) : (
                      <Select
                        value={formData[item.attribute]?.toString()}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            [item.attribute]: value,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full rounded-[20px]">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(item.dataPair).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.toString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  {item.type === "date" &&
                    (mode === "READ" ? (
                      <div className="flex-1 rounded-[20px] text-sm bg-gray-100 px-3 py-2">
                        {formData[item.attribute] &&
                        typeof formData[item.attribute] === "string"
                          ? new Date(
                              formData[item.attribute] as string
                            ).toLocaleDateString()
                          : formData[item.attribute] instanceof Date
                          ? (
                              formData[item.attribute] as Date
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    ) : (
                      <>
                        <Popover
                          open={openDatePopover === item.attribute}
                          onOpenChange={(open) =>
                            setOpenDatePopover(open ? item.attribute : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="rounded-[20px] flex-1"
                            >
                              {formData[item.attribute] &&
                              typeof formData[item.attribute] === "string"
                                ? new Date(
                                    formData[item.attribute] as string
                                  ).toLocaleDateString()
                                : formData[item.attribute] instanceof Date
                                ? (
                                    formData[item.attribute] as Date
                                  ).toLocaleDateString()
                                : "날짜 선택"}
                              <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              selected={
                                formData[item.attribute] instanceof Date
                                  ? (formData[item.attribute] as Date)
                                  : formData[item.attribute] &&
                                    typeof formData[item.attribute] === "string"
                                  ? new Date(formData[item.attribute] as string)
                                  : undefined
                              }
                              onSelect={(date) =>
                                handleDateChange(item.attribute, date)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    ))}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="people" className="grid gap-4 py-4">
              {/* READ 모드에서 연관된 운전자가 없는 경우 */}
              {mode === "READ" && associatedDrivers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  등록된 운전자가 없습니다.
                </div>
              )}

              {/* 운전자 검색 및 선택 (ADD/UPDATE 모드에서만 표시) */}
              {(mode === "ADD" || mode === "UPDATE") && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <PersonSearchInput
                      onSelectPerson={handleSelectDriver}
                      placeholder="운전자 이름 검색"
                      className="flex-1"
                      excludedDrivers={associatedDrivers}
                    />
                  </div>

                  {/* 선택된 운전자 목록 */}
                  {selectedDrivers.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        새로 추가할 운전자 ({selectedDrivers.length}명)
                      </h4>
                      {selectedDrivers.map((driver) => (
                        <div
                          key={driver.id}
                          className="bg-gray-100 rounded-[20px] p-4 relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                            onClick={() => handleRemoveDriver(driver.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <div className="pr-8">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                운전자명: {driver.name}
                              </span>
                              {driver.status && driver.status !== "active" && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  {driver.status}
                                </span>
                              )}
                              {driver.vip_level &&
                                driver.vip_level !== "none" && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    {driver.vip_level}
                                  </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">
                              소속:{" "}
                              {driver.org_dept_pos
                                ? driver.org_dept_pos
                                : "소속 없음"}
                            </p>
                            <p className="text-sm text-gray-600">
                              전화번호: {driver.phone_number}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      검색하여 운전자를 선택해주세요.
                    </div>
                  )}
                </>
              )}

              {/* 연관된 운전자 목록 (READ/UPDATE 모드에서만 표시) */}
              {associatedDrivers.length > 0 &&
                (mode === "READ" || mode === "UPDATE") && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      등록된 운전자 ({associatedDrivers.length}명)
                    </h4>
                    {associatedDrivers.map((driver) => {
                      const isInDeleteList = driversToDelete.some(
                        (d) => d.id === driver.id
                      );
                      return (
                        <div
                          key={driver.id}
                          className={`${
                            isInDeleteList
                              ? "bg-red-50 border-red-200 opacity-60"
                              : "bg-blue-50 border-blue-200"
                          } border rounded-[20px] p-4 relative`}
                        >
                          {/* UPDATE 모드에서만 삭제 버튼 표시 */}
                          {mode === "UPDATE" && !isInDeleteList && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                              onClick={() => handleDeleteDriverClick(driver)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                          {/* 삭제 목록에 있는 경우 표시 */}
                          {mode === "UPDATE" && isInDeleteList && (
                            <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              삭제 예정
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-1 pr-8">
                            <span className="font-medium text-sm">
                              운전자명: {driver.name}
                            </span>
                            {driver.status && driver.status !== "active" && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                {driver.status}
                              </span>
                            )}
                            {driver.vip_level &&
                              driver.vip_level !== "none" && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  {driver.vip_level}
                                </span>
                              )}
                          </div>
                          <p className="text-sm text-gray-600">
                            소속:{" "}
                            {driver.org_dept_pos
                              ? driver.org_dept_pos
                              : "소속 없음"}
                          </p>
                          <p className="text-sm text-gray-600">
                            전화번호: {driver.phone_number}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* 삭제 예정인 운전자 목록 (UPDATE 모드에서만 표시) */}
              {driversToDelete.length > 0 && mode === "UPDATE" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">
                    삭제 예정인 운전자 ({driversToDelete.length}명)
                  </h4>
                  {driversToDelete.map((driver) => (
                    <div
                      key={driver.id}
                      className="bg-red-50 border border-red-200 rounded-[20px] p-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveFromDeleteList(driver.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 mb-1 pr-8">
                        <span className="font-medium text-sm">
                          운전자명: {driver.name}
                        </span>
                        {driver.status && driver.status !== "active" && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            {driver.status}
                          </span>
                        )}
                        {driver.vip_level && driver.vip_level !== "none" && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {driver.vip_level}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        소속:{" "}
                        {driver.org_dept_pos
                          ? driver.org_dept_pos
                          : "소속 없음"}
                      </p>
                      <p className="text-sm text-gray-600">
                        전화번호: {driver.phone_number}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          {mode === "READ" ? (
            // READ 모드: 수정 버튼과 닫기 버튼만 (disableEdit가 true면 수정 버튼 숨김)
            <>
              {!disableEdit && (
                <Button
                  className="bg-[var(--point)]"
                  onClick={() => {
                    setMode("UPDATE");
                  }}
                >
                  수정
                </Button>
              )}
              <Button onClick={handleCancel} variant="outline">
                닫기
              </Button>
            </>
          ) : mode === "ADD" ? (
            // ADD 모드: 초기화, 닫기, 추가 버튼
            <>
              <Button
                onClick={() => {
                  // ADD 모드 초기화: defaultValue로 리셋
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const resetData: Record<string, any> = {};

                  if (modalData.photo) {
                    resetData[modalData.photo.attribute] =
                      modalData.photo.defaultValue;
                  }

                  modalData.fields.forEach((item) => {
                    resetData[item.attribute] = item.defaultValue;
                  });

                  setFormData(resetData);
                  setSelectedDrivers([]);
                }}
                variant="outline"
              >
                초기화
              </Button>
              <Button onClick={handleCancel} variant="outline">
                닫기
              </Button>
              <Button
                className="bg-[var(--point)]"
                onClick={() => {
                  if (onSubmit) {
                    onSubmit({
                      ...formData,
                      selectedDrivers: selectedDrivers,
                    });
                    // 저장 후 selectedDrivers 초기화
                    setSelectedDrivers([]);
                  }
                }}
              >
                추가
              </Button>
            </>
          ) : (
            // UPDATE 모드: 초기화, 수정 취소, 저장 버튼
            <>
              <Button
                onClick={() => {
                  setFormData(initialFormData);
                  setSelectedDrivers([]);
                  setDriversToDelete([]);
                }}
                variant="outline"
              >
                초기화
              </Button>
              <Button
                onClick={() => {
                  setMode("READ");
                  setDriversToDelete([]);
                }}
                variant="outline"
              >
                수정 취소
              </Button>
              <Button
                className="bg-[var(--point)]"
                onClick={async () => {
                  if (onSubmit) {
                    // 삭제할 운전자들이 있는 경우 실제 삭제 수행
                    if (driversToDelete.length > 0) {
                      try {
                        const { deletePersonVehicleRelation } = await import(
                          "@/hooks/useSupabase"
                        );

                        for (const driver of driversToDelete) {
                          const result = await deletePersonVehicleRelation(
                            data?.id,
                            driver.id
                          );
                          if (result.error) {
                            console.error(
                              `운전자 ${driver.name} 삭제 실패:`,
                              result.error
                            );
                            alert(`운전자 ${driver.name} 삭제에 실패했습니다.`);
                            return;
                          }
                        }

                        // 삭제 성공 시 연관된 운전자 목록 새로고침
                        if (data?.id) {
                          await fetchAssociatedDrivers(data.id);
                        }
                      } catch (error) {
                        console.error("운전자 삭제 중 오류:", error);
                        alert("운전자 삭제 중 오류가 발생했습니다.");
                        return;
                      }
                    }

                    onSubmit({
                      ...formData,
                      selectedDrivers: selectedDrivers,
                    });
                    // 저장 후 selectedDrivers와 driversToDelete 초기화
                    setSelectedDrivers([]);
                    setDriversToDelete([]);
                  }
                }}
              >
                저장
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>운전자 삭제 확인</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{driverToDelete?.name}</span>{" "}
              운전자를 삭제 목록에 추가하시겠습니까?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              저장 버튼을 눌러야 실제로 삭제됩니다.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleDeleteCancel} variant="outline">
              취소
            </Button>
            <Button onClick={handleAddToDeleteList} variant="destructive">
              삭제 목록에 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function Photo({
  mode,
  formData,
  setFormData,
  modalData,
}: {
  mode: "READ" | "ADD" | "UPDATE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (data: Record<string, any>) => void;
  modalData: ModalData;
}) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // photo_path가 변경될 때 Supabase에서 이미지 URL 가져오기
  useEffect(() => {
    const loadImageUrl = async () => {
      if (
        formData.photo_path &&
        formData.photo_path !== modalData.photo.defaultValue
      ) {
        try {
          const url = await getPhotoPath(formData.photo_path as string);
          setImageUrl(url);
          // imageUrl이 로드된 후 previewImage 초기화 (깜빡임 방지)
          setPreviewImage(null);
        } catch (error) {
          console.error("이미지 URL 로드 실패:", error);
          setImageUrl(null);
        }
      } else {
        setImageUrl(null);
        // 기본값으로 초기화된 경우 previewImage도 초기화
        setPreviewImage(null);
      }
    };

    loadImageUrl();
  }, [formData.photo_path, modalData.photo.defaultValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 미리보기 이미지 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        // 새로운 이미지 선택 시 기존 imageUrl 초기화
        setImageUrl(null);
      };
      reader.readAsDataURL(file);

      // Supabase에 이미지 업로드
      try {
        const folderName = modalData.title === "인물" ? "people" : "vehicles";
        const uploadResult = await uploadImageToSupabase(
          file,
          "images",
          folderName
        );

        if (uploadResult) {
          setFormData({
            ...formData,
            photo_path: uploadResult,
          });
        } else {
          console.error("이미지 업로드 실패");
          // 업로드 실패 시 previewImage 초기화
          setPreviewImage(null);
        }
      } catch (error) {
        console.error("이미지 업로드 중 오류:", error);
        // 업로드 실패 시 previewImage 초기화
        setPreviewImage(null);
      }
    }
  };

  const getImageSrc = () => {
    if (previewImage) return previewImage;
    if (imageUrl) return imageUrl;
    return modalData.photo.defaultValue;
  };

  if (mode === "READ") {
    return (
      <div className="relative w-full h-[100%] aspect-[2/1] rounded-lg border-2 border-gray-200 overflow-hidden">
        <Image src={getImageSrc()} alt="photo" fill className="object-cover" />
        {/* READ 모드에서는 버튼 없음 */}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100%] aspect-[2/1] rounded-lg border-2 border-gray-200 overflow-hidden">
      <Image src={getImageSrc()} alt="photo" fill className="object-cover" />
      <div className="absolute right-1 top-1">
        <Button
          className="bg-[var(--point)] rounded-full"
          onClick={() => document.getElementById("photo-input")?.click()}
        >
          <FolderSearch2 />
        </Button>
        <Button
          className="bg-red-500 rounded-full ml-1"
          onClick={() => {
            setPreviewImage(null);
            setImageUrl(null);
            setFormData({
              ...formData,
              photo_path: modalData.photo.defaultValue,
            });
          }}
        >
          <Trash />
        </Button>
      </div>
      <input
        id="photo-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
