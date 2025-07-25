"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Keypad } from "@/components/ui/keypad";
import { VehicleChoice } from "@/app/_components/VehicleChoice";
import { Info } from "@/app/_components/Info";
import { Record } from "@/app/_components/Record";
import { Vehicle } from "@/types";

const dummyVehicles = [
  {
    id: "06793110-f314-4c4f-afcb-705e9c0056d9",
    plate_number: "기타",
    vehicle_type: "골프카",
    is_public_vehicle: false,
    owner_department: null,
    access_start_date: null,
    access_end_date: null,
    is_free_pass_enabled: true,
    special_notes: "김재현",
    status: "active",
    created_at: "2025-06-25T08:13:25.263034+00:00",
    updated_at: "2025-06-25T08:13:25.263034",
  },
  {
    id: "c49b5e2b-72e0-4cac-8ac6-d654ac42426d",
    plate_number: "기타",
    vehicle_type: "잔디차",
    is_public_vehicle: true,
    owner_department: null,
    access_start_date: null,
    access_end_date: null,
    is_free_pass_enabled: false,
    special_notes: "(팜스코)",
    status: "active",
    created_at: "2025-06-25T08:13:25.263034+00:00",
    updated_at: "2025-06-25T08:13:25.263034",
  },
  {
    id: "023a213f-1374-47c4-907a-f54046a04006",
    plate_number: "기타",
    vehicle_type: "ATV",
    is_public_vehicle: false,
    owner_department: null,
    access_start_date: null,
    access_end_date: null,
    is_free_pass_enabled: false,
    special_notes: "구마마로 이치로",
    status: "active",
    created_at: "2025-06-25T08:13:25.263034+00:00",
    updated_at: "2025-06-25T08:13:25.263034",
  },
  {
    id: "6a976e69-43fc-43f2-bc2b-f5c0b534bbd7",
    plate_number: "기타",
    vehicle_type: "농약차",
    is_public_vehicle: false,
    owner_department: null,
    access_start_date: null,
    access_end_date: null,
    is_free_pass_enabled: false,
    special_notes: "(팜스코)",
    status: "active",
    created_at: "2025-06-25T08:13:25.263034+00:00",
    updated_at: "2025-06-25T08:13:25.263034",
  },
];
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

  const handleSearch = (value: string) => {
    // [수정] 1. 차량 번호 검색
    console.log(value);
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
          <Header back={true} title="차량 선택" />
          <main className="mx-6 pb-24">
            <VehicleChoice onChoice={handleChoice} data={dummyVehicles} />
          </main>
        </>
      )}
      {mode === "info" && (
        <>
          <Header back={true} title="차량 정보" />
          <main className="mx-6 pb-24">
            <Info vehicleData={dummyVehicles[0]} driverData={dummyDrivers} />
          </main>
        </>
      )}
      {mode === "record" && (
        <>
          <Header back={true} title="출입 기록" />
          <main className="mx-6 pb-24">
            <Record vehicleData={null} driverData={null} />
          </main>
        </>
      )}
    </>
  );
}
