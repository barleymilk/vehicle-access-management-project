import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputField } from "./ui/input-field";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import { useState, useRef } from "react";
import { addPersonToSupabase } from "@/hooks/useSupabase";
import Image from "next/image";

const FILTER_FIELDS = [
  {
    key: "photo_path",
    label: "사진",
    type: "file" as const,
  },
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
      { value: "일반", label: "일반", default: true },
    ],
  },
  {
    key: "is_worker",
    label: "외부용역",
    placeholder: "외부용역 여부",
    type: "select" as const,
    options: [
      { value: false, label: "X", default: true },
      { value: true, label: "O" },
    ],
  },
  {
    key: "status",
    label: "상태",
    placeholder: "활성/비활성",
    type: "select" as const,
    options: [
      { value: "active", label: "활성", default: true },
      { value: "inactive", label: "비활성" },
      { value: "blocked", label: "차단" },
    ],
  },
  {
    key: "start_date",
    label: "활동 시작일",
    type: "date" as const,
  },
  {
    key: "end_date",
    label: "활동 종료일",
    type: "date" as const,
  },
  {
    key: "contact_person_name",
    label: "담당자 이름",
    placeholder: "담당자 이름",
  },
  {
    key: "contact_person_phone",
    label: "담당자 번호",
    placeholder: "숫자만 입력",
  },
];

// 이미지 업로드 컴포넌트
const ImageUploadField = ({
  field,
  filters,
  setFilters,
}: {
  field: (typeof FILTER_FIELDS)[number];
  filters: Record<string, string | boolean | Date | File | undefined>;
  setFilters: React.Dispatch<
    React.SetStateAction<
      Record<string, string | boolean | Date | File | undefined>
    >
  >;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedImage = filters[field.key] as File | undefined;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilters((prev) => {
        const newFilters = { ...prev };
        newFilters[field.key] = file;
        return newFilters;
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2 mt-3">
      <div
        key={field.key}
        className="relative w-30 h-30 rounded-full border-2 border-gray-200 overflow-hidden"
      >
        {uploadedImage ? (
          <Image
            src={URL.createObjectURL(uploadedImage)}
            alt="업로드된 프로필 이미지"
            fill
            className="object-cover"
          />
        ) : (
          <Image
            src="/user.webp"
            alt="프로필 이미지"
            fill
            className="object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              const target = e.target as HTMLImageElement;
              target.src = "/user.webp";
            }}
          />
        )}
      </div>
      <div className="flex-1 flex justify-center items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleButtonClick}
          >
            이미지 업로드
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setFilters((prev) => {
                const newFilters = { ...prev };
                newFilters[field.key] = undefined;
                return newFilters;
              });
            }}
          >
            이미지 삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

const renderField = (
  field: (typeof FILTER_FIELDS)[number],
  filters: Record<string, string | boolean | Date | File | undefined>,
  setFilters: React.Dispatch<
    React.SetStateAction<
      Record<string, string | boolean | Date | File | undefined>
    >
  >,
  openDatePopover: string | null,
  setOpenDatePopover: (open: string | null) => void,
  handleDateChange: (fieldKey: string, date: Date | undefined) => void
) => {
  if (field.type === "file") {
    return (
      <ImageUploadField
        key={field.key}
        field={field}
        filters={filters}
        setFilters={setFilters}
      />
    );
  }

  if (field.type === "select") {
    return (
      <div key={field.key} className="flex gap-2 mt-3">
        <Label
          htmlFor={field.key}
          className="w-22 flex-shrink-0 text-md font-semibold"
        >
          {field.label}
        </Label>
        <div className="flex-1">
          <Select
            value={
              filters[field.key] !== undefined
                ? String(filters[field.key])
                : field.options?.find((option) => option.default)?.value !==
                  undefined
                ? String(field.options?.find((option) => option.default)?.value)
                : "전체"
            }
            onValueChange={(value) => {
              let selectValue: string | boolean | undefined;
              if (
                value === field.options?.find((option) => option.default)?.value
              ) {
                selectValue = undefined;
              } else if (value === "true") {
                selectValue = true;
              } else if (value === "false") {
                selectValue = false;
              } else {
                selectValue = value;
              }
              setFilters((prev) => {
                const newFilters = { ...prev };
                newFilters[field.key] = selectValue;
                return newFilters;
              });
            }}
          >
            <SelectTrigger className="w-full rounded-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div key={field.key} className="flex gap-2 mt-3">
        <Label
          htmlFor={field.key}
          className="w-22 flex-shrink-0 text-md font-semibold"
        >
          {field.label}
        </Label>
        <Popover
          open={openDatePopover === field.key}
          onOpenChange={(open) => setOpenDatePopover(open ? field.key : null)}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-full flex-1">
              {filters[field.key] && typeof filters[field.key] === "string"
                ? new Date(filters[field.key] as string).toLocaleDateString()
                : filters[field.key] instanceof Date
                ? (filters[field.key] as Date).toLocaleDateString()
                : "날짜 선택"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={
                filters[field.key] instanceof Date
                  ? (filters[field.key] as Date)
                  : filters[field.key] && typeof filters[field.key] === "string"
                  ? new Date(filters[field.key] as string)
                  : undefined
              }
              onSelect={(date) => handleDateChange(field.key, date)}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <InputField
      key={field.key}
      label={field.label}
      id={field.key}
      value={
        typeof filters[field.key] === "string"
          ? (filters[field.key] as string)
          : ""
      }
      placeholder={field.placeholder}
      onChange={(value) =>
        setFilters((prev) => {
          const newFilters = { ...prev };
          newFilters[field.key] = value;
          return newFilters;
        })
      }
      onClear={() =>
        setFilters((prev) => {
          const newFilters = { ...prev };
          delete newFilters[field.key];
          return newFilters;
        })
      }
    />
  );
};
export default function UpdateModal({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) {
  const [filters, setFilters] = useState<
    Record<string, string | boolean | Date | File | undefined>
  >({});
  const [openDatePopover, setOpenDatePopover] = useState<string | null>(null);
  const handleDateChange = (fieldKey: string, date: Date | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      newFilters[fieldKey] = date;
      return newFilters;
    });
  };
  const handleClear = () => {
    setFilters({});
  };
  const handleSave = async () => {
    try {
      // 필터 데이터를 Supabase 형식으로 변환
      const personData = {
        name: filters.name as string,
        organization: filters.organization as string,
        department: filters.department as string,
        position: filters.position as string,
        phone_number: filters.phone_number as string,
        vip_level: filters.vip_level as string,
        is_worker: filters.is_worker as boolean,
        status: filters.status as string,
        activity_start_date: filters.start_date as Date,
        activity_end_date: filters.end_date as Date,
        contact_person_name: filters.contact_person_name as string,
        contact_person_phone: filters.contact_person_phone as string,
      };

      const { data, error } = await addPersonToSupabase(personData);

      if (error) {
        console.error("데이터 저장 중 오류:", error);
        alert("데이터 저장에 실패했습니다.");
        return;
      }

      console.log("데이터 저장 성공:", data);
      alert("데이터가 성공적으로 저장되었습니다.");

      // 모달 닫기
      onCancel();

      // 필터 초기화
      setFilters({});
    } catch (error) {
      console.error("데이터 저장 중 오류:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>UpdateModal</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {FILTER_FIELDS.map((field) =>
            renderField(
              field,
              filters,
              setFilters,
              openDatePopover,
              setOpenDatePopover,
              handleDateChange
            )
          )}
        </div>
        <DialogFooter className="flex flex-row justify-between mt-4">
          <Button onClick={() => handleClear()} className="w-1/2">
            초기화
          </Button>
          <Button onClick={() => handleSave()} className="w-1/2">
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
