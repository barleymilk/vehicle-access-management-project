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
import { ChevronDownIcon, FolderSearch2, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { handleDatePairChange, DatePairConfig } from "@/lib/utils";
import { ModalData } from "@/types";
import { getPhotoPath, uploadImageToSupabase } from "@/hooks/useSupabase";

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
        } catch (error) {
          console.error("이미지 URL 로드 실패:", error);
          setImageUrl(null);
        }
      } else {
        setImageUrl(null);
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
        }
      } catch (error) {
        console.error("이미지 업로드 중 오류:", error);
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

export default function CommonModal({
  state,
  open,
  onCancel,
  data,
  title = "데이터",
  modalData,
  onSubmit,
  onModeChange,
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
  }, [mode]); // onModeChange를 dependency에서 제거 (무한 루프 방지)
  // 초기 데이터를 별도로 저장 (초기화 시 사용)
  const [initialFormData, setInitialFormData] = useState(() => {
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
    setInitialFormData(newFormData); // initialFormData도 함께 업데이트
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

  // 모달 닫기 핸들러 (UPDATE 모드에서는 READ 모드로 복귀)
  const handleCancel = () => {
    if (mode === "UPDATE") {
      setMode("READ");
    } else {
      onCancel();
    }
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
                  <div className="flex-1 rounded-full text-sm bg-gray-100 px-3 py-2">
                    {formData[item.attribute] || "-"}
                  </div>
                ) : (
                  <Input
                    className="flex-1 rounded-full text-sm placeholder:text-gray-400"
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
                  <div className="flex-1 rounded-full text-sm bg-gray-100 px-3 py-2">
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
                    <SelectTrigger className="w-full rounded-full">
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
                  <div className="flex-1 rounded-full text-sm bg-gray-100 px-3 py-2">
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
                    <SelectTrigger className="w-full rounded-full">
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
                  <div className="flex-1 rounded-full text-sm bg-gray-100 px-3 py-2">
                    {formData[item.attribute] &&
                    typeof formData[item.attribute] === "string"
                      ? new Date(
                          formData[item.attribute] as string
                        ).toLocaleDateString()
                      : formData[item.attribute] instanceof Date
                      ? (formData[item.attribute] as Date).toLocaleDateString()
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
                          className="rounded-full flex-1"
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
        </div>
        <DialogFooter>
          {mode === "READ" ? (
            // READ 모드: 수정 버튼과 닫기 버튼만
            <>
              <Button
                className="bg-[var(--point)]"
                onClick={() => {
                  setMode("UPDATE");
                }}
              >
                수정
              </Button>
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
                    onSubmit(formData);
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
                }}
                variant="outline"
              >
                초기화
              </Button>
              <Button
                onClick={() => {
                  setMode("READ");
                }}
                variant="outline"
              >
                수정 취소
              </Button>
              <Button
                className="bg-[var(--point)]"
                onClick={() => {
                  if (onSubmit) {
                    onSubmit(formData);
                  }
                }}
              >
                저장
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
