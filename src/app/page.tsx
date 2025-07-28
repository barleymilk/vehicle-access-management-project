"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Keypad } from "@/components/ui/keypad";
import { VehicleChoice } from "@/app/_components/VehicleChoice";
import { Info } from "@/app/_components/Info";
import { Record } from "@/app/_components/Record";
import { Vehicle } from "@/types";
import { useVehicleSearch } from "@/hooks/useSupabase";

const dummyDrivers = [
  {
    id: "075d3ddc-b1bd-4e19-890d-2a1ea5b0b1f3",
    name: "김윤성",
    phone_number: "01023896906",
    organization: "팜스코",
    department: null,
    position: null,
    photo_path: null,
    vip_level: "none",
    is_worker: false,
    activity_start_date: null,
    activity_end_date: null,
    contact_person_name: null,
    contact_person_phone: null,
    status: "active",
    created_at: "2025-06-25T08:14:55.318432+00:00",
    updated_at: "2025-06-25T08:14:55.318432",
    tag: "대내기관",
    org_dept_pos: "팜스코 / nan / nan",
  },
  {
    id: "0358fed2-7367-425e-a428-311e67b63e5f",
    name: "여인구",
    phone_number: "01023896906",
    organization: "팜스코",
    department: null,
    position: null,
    photo_path: null,
    vip_level: "VIP2",
    is_worker: false,
    activity_start_date: null,
    activity_end_date: null,
    contact_person_name: null,
    contact_person_phone: null,
    status: "active",
    created_at: "2025-06-25T08:14:55.318432+00:00",
    updated_at: "2025-06-25T08:14:55.318432",
    tag: "대내기관",
    org_dept_pos: "팜스코 / nan / nan",
  },
  {
    id: "075d3ddc-b1bd-4e19-890d-2a1ea5b0b1f3",
    name: "김윤성",
    phone_number: "01023896906",
    organization: "팜스코",
    department: null,
    position: null,
    photo_path: null,
    vip_level: "none",
    is_worker: false,
    activity_start_date: null,
    activity_end_date: null,
    contact_person_name: null,
    contact_person_phone: null,
    status: "active",
    created_at: "2025-06-25T08:14:55.318432+00:00",
    updated_at: "2025-06-25T08:14:55.318432",
    tag: "대내기관",
    org_dept_pos: "팜스코 / nan / nan",
  },
];

export default function Home() {
  // 1. search: 차량번호 검색
  // 2. choice: 차량 리스트 중 하나 선택
  // 3. info: 차량 정보, 운전자 정보, 작업 정보 열람, 선택(운전자, 작업)
  // 4. record: 출입 기록 작성

  // 1) 차량 데이터 여러 개: 1-2-3-4
  // 2) 차량 데이터 한 개: 1-3-4
  // 3) 새로운 차량 or 차량 데이터 없음: 1-4

  const [mode, setMode] = useState<"search" | "choice" | "info" | "record">(
    "search"
  );
  const [searchValue, setSearchValue] = useState<string>("");

  const { data, loading, error } = useVehicleSearch(searchValue);

  // 검색 결과에 따른 모드 전환
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // 검색 결과가 변경될 때마다 모드 결정
  useEffect(() => {
    if (!loading && searchValue.trim()) {
      if (data && Array.isArray(data)) {
        if (data.length === 0) {
          // 데이터가 없으면 record 모드로
          setMode("record");
        } else if (data.length === 1) {
          // 데이터가 1개면 info 모드로
          setMode("info");
        } else {
          // 데이터가 여러 개면 choice 모드로
          setMode("choice");
        }
      }
    }
  }, [data, loading, searchValue]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    setMode("search");
    setSearchValue("");
  };

  const handleChoice = (value: Vehicle | null) => {
    // [수정] 2. 차량 선택
    console.log(value);
    if (value) {
      setMode("info");
    } else {
      setMode("record");
    }
  };

  return (
    <>
      {/* <UserProfile /> */}
      {mode === "search" && (
        <>
          <Header title="차량 검색" />
          <main className="mx-6 pb-24">
            <Keypad onSearch={handleSearch} />
          </main>
        </>
      )}
      {mode === "choice" && (
        <>
          <Header back={true} title="차량 선택" onBack={handleBack} />
          <main className="mx-6 pb-24">
            <VehicleChoice
              onChoice={handleChoice}
              data={(data as Vehicle[]) || []}
            />
          </main>
        </>
      )}
      {mode === "info" && (
        <>
          <Header back={true} title="차량 정보" onBack={handleBack} />
          <main className="mx-6 pb-24">
            <Info
              vehicleData={(data as Vehicle[])?.[0] || null}
              driverData={dummyDrivers}
            />
          </main>
        </>
      )}
      {mode === "record" && (
        <>
          <Header back={true} title="출입 기록" onBack={handleBack} />
          <main className="mx-6 pb-24">
            <Record vehicleData={null} driverData={null} />
          </main>
        </>
      )}
    </>
  );
}
