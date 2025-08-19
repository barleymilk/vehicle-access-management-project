import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { useState } from "react";
import { uploadImageToSupabase } from "@/hooks/useSupabase";

// 필드 타입 정의
export interface FieldConfig {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "date" | "file" | "boolean";
  isInput: boolean;
  isSelect: boolean;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean;
  autoGenerate?: (formData: Record<string, unknown>) => unknown;
}

// AddModal Props를 범용적으로 수정
interface AddModalProps {
  title: string;
  description: string;
  open: boolean;
  onCancel: () => void;
  fields: FieldConfig[];
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

function AddModal({
  title,
  description,
  open,
  onCancel,
  fields = [],
  onSubmit,
  initialData = {},
}: AddModalProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = { ...initialData };

    // 필드의 기본값 설정 (모두 문자열로 관리)
    fields.forEach((field) => {
      if (field.defaultValue !== undefined && initial[field.id] === undefined) {
        initial[field.id] = field.defaultValue;
      }
    });

    return initial;
  });
  const [openDatePopover, setOpenDatePopover] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleChange = (field: string, value: unknown) => {
    let processedValue = value;

    // 필드 타입에 따른 처리
    const fieldConfig = fields.find((f) => f.id === field);
    if (fieldConfig?.type === "date") {
      processedValue = value ? new Date(value) : undefined;
    }

    setFormData((prev) => {
      const newFormData = { ...prev, [field]: processedValue };

      // 날짜 필드 간 연동 로직 (DataFilter와 동일)
      if (field === "activity_start_date" || field === "activity_end_date") {
        const startDateKey = "activity_start_date";
        const endDateKey = "activity_end_date";

        if (field === startDateKey && processedValue instanceof Date) {
          // 시작일 선택 시
          if (!newFormData[endDateKey]) {
            // 종료일이 없으면 시작일과 같은 날짜로 설정
            newFormData[endDateKey] = processedValue;
          } else if (
            newFormData[startDateKey] &&
            newFormData[endDateKey] &&
            newFormData[startDateKey] instanceof Date &&
            newFormData[endDateKey] instanceof Date &&
            newFormData[startDateKey] > newFormData[endDateKey]
          ) {
            // 시작일이 종료일보다 크면 종료일을 시작일과 같은 날짜로 설정
            newFormData[endDateKey] = processedValue;
          }
        } else if (field === endDateKey && processedValue instanceof Date) {
          // 종료일 선택 시
          if (!newFormData[startDateKey]) {
            // 시작일이 없으면 종료일과 같은 날짜로 설정
            newFormData[startDateKey] = processedValue;
          } else if (
            newFormData[startDateKey] &&
            newFormData[endDateKey] &&
            newFormData[startDateKey] instanceof Date &&
            newFormData[endDateKey] instanceof Date &&
            newFormData[endDateKey] < newFormData[startDateKey]
          ) {
            // 종료일이 시작일보다 작으면 시작일을 종료일과 같은 날짜로 설정
            newFormData[startDateKey] = processedValue;
          }
        }
      }

      return newFormData;
    });

    // 날짜 필드 선택 시 팝업 자동 닫기
    if (field === "activity_start_date" || field === "activity_end_date") {
      setOpenDatePopover(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // const handleSubmit = () => {
  //   onSubmit(formData);
  //   onCancel();
  // };
  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      setUploadProgress("데이터 검증 중...");

      let photoUrl = null;

      if (selectedFile) {
        setUploadProgress("이미지 업로드 중...");

        // 파일 검증
        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error("이미지 파일 크기가 5MB를 초과합니다.");
        }
        if (!selectedFile.type.startsWith("image/")) {
          throw new Error("올바른 이미지 파일이 아닙니다.");
        }

        // 이미지 업로드
        photoUrl = await uploadImageToSupabase(
          selectedFile,
          "images",
          "people"
        );
        if (!photoUrl) {
          throw new Error("이미지 업로드에 실패했습니다.");
        }

        setUploadProgress("데이터 저장 중...");
      }

      // 폼 데이터에 이미지 경로 추가
      const finalData = {
        ...formData,
        photo_path: photoUrl || formData.photo_path,
      };

      // boolean 타입 필드를 문자열에서 boolean으로 변환
      fields.forEach((field) => {
        if (field.type === "boolean" && finalData[field.id] !== undefined) {
          finalData[field.id] = finalData[field.id] === "true";
        }
      });

      // 자동 생성 필드 처리
      fields.forEach((field) => {
        if (field.autoGenerate) {
          const generatedValue = field.autoGenerate(finalData);
          if (generatedValue !== undefined) {
            (finalData as Record<string, unknown>)[field.id] = generatedValue;
          }
        }
      });

      // 부모 컴포넌트의 onSubmit 호출
      await onSubmit(finalData);

      setUploadProgress("완료!");
      setTimeout(() => {
        setFormData(initialData);
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress("");
        onCancel();
      }, 1000);
    } catch (error) {
      console.error("저장 중 오류:", error);
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류";
      alert(`저장에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleClear = () => {
    const cleared: Record<string, unknown> = { ...initialData };

    // 필드의 기본값 설정 (모두 문자열로 관리)
    fields.forEach((field) => {
      if (field.defaultValue !== undefined && cleared[field.id] === undefined) {
        cleared[field.id] = field.defaultValue;
      }
    });

    setFormData(cleared);
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields && fields.length > 0 ? (
            fields.map((item) => {
              // 날짜 타입은 isInput 값과 관계없이 Calendar 컴포넌트 사용
              if (item.type === "date") {
                return (
                  <div key={item.id} className="flex items-center gap-2 mt-3">
                    <label
                      htmlFor={item.id}
                      className="w-22 flex-shrink-0 text-md font-semibold"
                    >
                      {item.label}
                    </label>
                    <Popover
                      open={openDatePopover === item.id}
                      onOpenChange={(open) =>
                        setOpenDatePopover(open ? item.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-full flex-1"
                        >
                          {formData[item.id] &&
                          typeof formData[item.id] === "string"
                            ? new Date(
                                formData[item.id] as string
                              ).toLocaleDateString()
                            : formData[item.id] instanceof Date
                            ? (formData[item.id] as Date).toLocaleDateString()
                            : "날짜 선택"}
                          <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={
                            formData[item.id] instanceof Date
                              ? (formData[item.id] as Date)
                              : formData[item.id] &&
                                typeof formData[item.id] === "string"
                              ? new Date(formData[item.id] as string)
                              : undefined
                          }
                          onSelect={(date) => handleChange(item.id, date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }

              if (item.isInput) {
                return (
                  <InputField
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    placeholder={item.placeholder}
                    type={item.type as "number" | "text"}
                    value={
                      (formData[item.id] as string) || item.defaultValue || ""
                    }
                    onChange={(value) => {
                      handleChange(item.id, value);
                    }}
                    required={item.required}
                  />
                );
              } else if (item.isSelect && item.type === "boolean") {
                return (
                  <SelectField
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    options={item.options || []}
                    value={
                      (formData[item.id] as string) ||
                      item.defaultValue ||
                      "false"
                    }
                    onChange={(value) => {
                      handleChange(item.id, value);
                    }}
                  />
                );
              } else if (item.isSelect && item.type !== "boolean") {
                return (
                  <SelectField
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    options={item.options || []}
                    value={
                      (formData[item.id] as string) || item.defaultValue || ""
                    }
                    onChange={(value) => {
                      handleChange(item.id, value);
                    }}
                  />
                );
              } else if (item.type === "file") {
                return (
                  <div key={item.id} className="flex items-center gap-2 mt-3">
                    <label
                      htmlFor={item.id}
                      className="w-22 flex-shrink-0 text-md font-semibold"
                    >
                      {item.label}
                    </label>
                    <input
                      id={item.id}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                );
              }
              return null;
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              필드 설정이 없습니다.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-4">
          {isUploading && (
            <div className="w-full text-center text-sm text-gray-600">
              {uploadProgress}
            </div>
          )}
          <div className="flex flex-row justify-between w-full gap-2">
            <button
              onClick={handleClear}
              className="w-1/2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isUploading}
            >
              초기화
            </button>
            <button
              onClick={handleSubmit}
              className="w-1/2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isUploading}
            >
              {isUploading ? "처리 중..." : "저장"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddModal;
