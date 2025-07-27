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

interface SearchFilterProps {
  onSearch?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  plate_number?: string;
  vehicle_type?: string;
  name?: string;
  org_dept_pos?: string;
  phone?: string;
  passengers?: string;
  notes?: string;
  start_date?: Date;
  end_date?: Date;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
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
            value=""
            placeholder="01가1234 (혹은 기타)"
          />
          <InputField
            label="차량종류"
            id="vehicle_type"
            value=""
            placeholder="SUV"
          />
          <InputField label="운전자명" id="name" value="" />
          <InputField label="운전자소속" id="org_dept_pos" value="" />
          <InputField
            label="운전자번호"
            id="phone"
            value=""
            placeholder="숫자만 입력"
          />
          <InputField label="동승자" id="passengers" value="" />
          <InputField label="특이사항" id="notes" value="" />
          <div className="flex gap-2 mt-3">
            <Label
              htmlFor="entered_at"
              className="w-22 flex-shrink-0 text-md font-semibold"
            >
              검색 시작일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full flex-1">
                  날짜 선택
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar mode="single" captionLayout="dropdown" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 mt-3">
            <Label
              htmlFor="entered_at"
              className="w-22 flex-shrink-0 text-md font-semibold"
            >
              검색 종료일
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-full flex-1">
                  날짜 선택
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar mode="single" captionLayout="dropdown" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DrawerFooter className="flex-shrink-0">
          <DrawerClose asChild>
            <Button>닫기</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
