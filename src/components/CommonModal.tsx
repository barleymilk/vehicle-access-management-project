import { useState } from "react";
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

// mode 상태를 통해 읽기, 추가, 업데이트 기능이 각각 가능하게 함
// READ: 수정 버튼, 삭제 버튼, 닫기 버튼
// ADD: 초기화 버튼, 추가 버튼, 닫기 버튼
// UPDATE: 초기화 버튼, 저장 버튼, 닫기 버튼

const dummyVehicleData = {
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
      value: "1234가1234",
      type: "text",
      checkFunction: () => {
        console.log("plate_number 검사 함수");
      },
      required: true,
    },
    {
      attribute: "vehicle_type",
      label: "차량종류",
      placeholder: "차량종류",
      value: "SUV",
      type: "text",
    },
    {
      attribute: "is_public_vehicle",
      label: "공용여부",
      placeholder: "공용",
      value: false,
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
    },
    {
      attribute: "access_start_date",
      label: "접근 시작일",
      type: "date",
      value: "2025-01-01",
      datePair: {
        startDateField: "access_start_date",
        endDateField: "access_end_date",
      },
    },
    {
      attribute: "access_end_date",
      label: "접근 종료일",
      type: "date",
      value: "2025-01-01",
      datePair: {
        startDateField: "access_start_date",
        endDateField: "access_end_date",
      },
    },
    {
      attribute: "is_free_pass_enabled",
      label: "프리패스",
      value: false,
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
      value: "특이사항 노트",
    },
    {
      attribute: "status",
      label: "상태",
      type: "select",
      value: "active",
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

interface CommonModalProps {
  state: "READ" | "ADD" | "UPDATE";
  open: boolean;
  onCancel: () => void;
}

function Photo({ mode }: { mode: "READ" | "ADD" | "UPDATE" }) {
  if (mode === "READ") {
    return (
      <div className="relative w-full h-[100%] aspect-[2/1] rounded-lg border-2 border-gray-200 overflow-hidden">
        <Image src="/car.webp" alt="photo" fill className="object-cover" />
        <div className="absolute right-1 top-1">
          <Button className="bg-[var(--point)] rounded-full">
            <FolderSearch2 />
          </Button>
          <Button className="bg-red-500 rounded-full ml-1">
            <Trash />
          </Button>
        </div>
      </div>
    );
  }
  return <Input type="file" />;
}

export default function CommonModal({
  state,
  open,
  onCancel,
}: CommonModalProps) {
  const [mode] = useState(state); // mode: READ, ADD, UPDATE
  // 초기 데이터를 별도로 저장 (초기화 시 사용)
  const [initialFormData] = useState(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialData: Record<string, any> = {};

    // 사진 데이터 추가
    if (dummyVehicleData.photo) {
      initialData[dummyVehicleData.photo.attribute] =
        dummyVehicleData.photo.value || dummyVehicleData.photo.defaultValue;
    }

    // 일반 필드 데이터 추가
    dummyVehicleData.fields.forEach((item) => {
      initialData[item.attribute] = item.value || item.defaultValue;
    });

    return initialData;
  });
  const [formData, setFormData] = useState(initialFormData);
  const [openDatePopover, setOpenDatePopover] = useState<string | null>(null);

  const handleDateChange = (field: string, value: unknown) => {
    let processedValue = value;

    // 필드 타입에 따른 처리
    const fieldConfig = dummyVehicleData.fields.find(
      (f) => f.attribute === field
    );
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

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {dummyVehicleData.title}{" "}
            {mode === "READ" ? "정보" : mode === "ADD" ? "추가" : "수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {dummyVehicleData.photo && <Photo mode={mode} />}
          {dummyVehicleData.fields.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <Label className="w-22 flex-shrink-0 text-sm font-semibold">
                {item.label} {item.required && "*"}
              </Label>
              {/* item.type의 값에 따라 다르게 렌더링: text, boolean(select 타입의 일종), select, date */}
              {item.type === "text" && (
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
              )}
              {item.type === "boolean" && item.dataPair && (
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
              )}
              {item.type === "select" && item.dataPair && (
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
              )}
              {item.type === "date" && (
                <>
                  <Popover
                    open={openDatePopover === item.attribute}
                    onOpenChange={(open) =>
                      setOpenDatePopover(open ? item.attribute : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="rounded-full flex-1">
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
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setFormData(initialFormData);
            }}
            variant="outline"
          >
            초기화
          </Button>
          <Button onClick={onCancel} variant="outline">
            닫기
          </Button>
          <Button onClick={onCancel}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
