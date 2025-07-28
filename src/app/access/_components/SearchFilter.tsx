"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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

interface SearchFilterProps {
  onSearch?: (filters: SearchFilters) => void;
}

interface SearchFilters {
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

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleDateChange = (
    field: "start_date" | "end_date",
    date: Date | undefined
  ) => {
    if (field === "start_date") {
      setStartDate(date);
      setFilters((prev) => ({
        ...prev,
        start_date: date,
      }));
    } else {
      setEndDate(date);
      setFilters((prev) => ({
        ...prev,
        end_date: date,
      }));
    }
  };

  const handleClear = () => {
    setFilters({});
    setStartDate(undefined);
    setEndDate(undefined);
    onSearch?.({});
  };

  // console.log("filters:", filters);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="fixed right-4">
          <ListFilter className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>검색 옵션</DrawerTitle>
          <DrawerDescription className="sr-only">
            여러 검색 옵션을 선택할 수 있습니다.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <InputField
            label="차량번호"
            id="plate_number"
            value={filters.plate_number || ""}
            placeholder="01가1234 (혹은 기타)"
            onChange={(value) =>
              setFilters({ ...filters, plate_number: value })
            }
          />
          <InputField
            label="차량종류"
            id="vehicle_type"
            value={filters.vehicle_type || ""}
            placeholder="SUV"
            onChange={(value) =>
              setFilters({ ...filters, vehicle_type: value })
            }
          />
          <InputField
            label="운전자명"
            id="name"
            value={filters.name || ""}
            onChange={(value) => setFilters({ ...filters, name: value })}
          />
          <InputField
            label="운전자소속"
            id="org_dept_pos"
            value={filters.org_dept_pos || ""}
            onChange={(value) =>
              setFilters({ ...filters, org_dept_pos: value })
            }
          />
          <InputField
            label="운전자번호"
            id="phone"
            value={filters.phone || ""}
            placeholder="숫자만 입력"
            onChange={(value) => setFilters({ ...filters, phone: value })}
          />
          <InputField
            label="동승자"
            id="passengers"
            value={filters.passengers || ""}
            onChange={(value) => setFilters({ ...filters, passengers: value })}
          />
          <InputField
            label="방문목적"
            id="purpose"
            value={filters.purpose || ""}
            onChange={(value) => setFilters({ ...filters, purpose: value })}
          />
          <InputField
            label="특이사항"
            id="notes"
            value={filters.notes || ""}
            onChange={(value) => setFilters({ ...filters, notes: value })}
          />
          <div className="flex gap-2 mt-3">
            <Label
              htmlFor="start_date"
              className="w-22 flex-shrink-0 text-md font-semibold"
            >
              검색 시작일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full flex-1">
                  {startDate ? startDate.toLocaleDateString() : "날짜 선택"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={startDate}
                  onSelect={(date) => handleDateChange("start_date", date)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 mt-3">
            <Label
              htmlFor="end_date"
              className="w-22 flex-shrink-0 text-md font-semibold"
            >
              검색 종료일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full flex-1">
                  {endDate ? endDate.toLocaleDateString() : "날짜 선택"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={endDate}
                  onSelect={(date) => handleDateChange("end_date", date)}
                />
              </PopoverContent>
            </Popover>
          </div>
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
}
