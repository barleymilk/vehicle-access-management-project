"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { InputField } from "@/components/ui/input-field";
import { ChevronDownIcon, ListFilter } from "lucide-react";
import { useState } from "react";
import { handleDatePairChange, DatePairConfig } from "@/lib/utils";

interface FilterField {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "boolean" | "select";
  options?: { value: string | boolean; label: string }[];
  datePair?: DatePairConfig;
}

interface DataFilterProps {
  onSearch: (
    filters: Record<string, string | Date | boolean | undefined>
  ) => void;
  fields: FilterField[];
  title?: string;
  description?: string;
}

export const DataFilter = ({
  onSearch,
  fields,
  title = "검색 옵션",
  description = "여러 검색 옵션을 선택할 수 있습니다.",
}: DataFilterProps) => {
  const [filters, setFilters] = useState<
    Record<string, string | Date | boolean | undefined>
  >({});
  const [openDatePopover, setOpenDatePopover] = useState<string | null>(null);

  const handleClear = () => {
    setFilters({});
    onSearch?.({});
  };

  // 날짜 필드 간 연동 로직
  const handleDateChange = (fieldKey: string, date: Date | undefined) => {
    // 날짜 쌍이 있는 필드에 대해 연동 로직 적용
    const fieldConfig = fields.find((f) => f.key === fieldKey);
    if (fieldConfig?.type === "date" && fieldConfig.datePair) {
      const newFilters = handleDatePairChange(
        fieldKey,
        date,
        filters,
        fieldConfig.datePair
      );
      setFilters(newFilters);
    } else {
      // 날짜 쌍이 아닌 경우 단순히 값만 설정
      setFilters((prev) => ({ ...prev, [fieldKey]: date }));
    }

    setOpenDatePopover(null); // 팝업 닫기
  };

  const renderField = (field: FilterField) => {
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
                filters[field.key] === true
                  ? "true"
                  : filters[field.key] === false
                  ? "false"
                  : typeof filters[field.key] === "string" &&
                    filters[field.key] !== "전체"
                  ? (filters[field.key] as string)
                  : "전체"
              }
              onValueChange={(value) => {
                let selectValue: string | boolean | undefined;
                if (value === "전체") {
                  selectValue = undefined;
                } else if (value === "true") {
                  selectValue = true;
                } else if (value === "false") {
                  selectValue = false;
                } else {
                  selectValue = value;
                }
                setFilters((prev) => ({ ...prev, [field.key]: selectValue }));
              }}
            >
              <SelectTrigger className="w-full rounded-full">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
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
                    : filters[field.key] &&
                      typeof filters[field.key] === "string"
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
          setFilters((prev) => ({ ...prev, [field.key]: value }))
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

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="fixed right-4">
          <ListFilter className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription className="sr-only">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {fields.map(renderField)}
        </div>
        <DrawerFooter className="flex-shrink-0">
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              초기화
            </Button>
            <DrawerClose asChild>
              <Button onClick={() => onSearch?.(filters)} className="flex-1">
                검색
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
