"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { Keypad } from "@/components/ui/keypad";
import { VehicleChoice } from "@/app/_components/VehicleChoice";
import { Info } from "@/app/_components/Info";
import { Record } from "@/app/_components/Record";
import { Driver, Vehicle, RecordData } from "@/types";

// API 호출 함수: 차량 번호 -> 차량 리스트
async function searchVehicles(plate_number: string) {
  const response = await fetch("/api/search-vehicles", {
    method: "POST",
    body: JSON.stringify({ plate_number }),
  });
  const data = await response.json();
  return data || [];
}

// API 호출 함수: 차량 ID -> 운전자 리스트
async function searchDrivers(vehicle_id: string) {
  console.log("@searchDrivers > vehicle_id:", vehicle_id);
  const response = await fetch("/api/search-drivers", {
    method: "POST",
    body: JSON.stringify({ vehicle_id }),
  });
  const data = await response.json();
  return data || [];
}

// API 호출 함수: 차량 ID -> 차량 정보
async function searchVehicleInfo(vehicle_id: string) {
  console.log("@searchVehicleInfo > vehicle_id:", vehicle_id);
  const response = await fetch("/api/search-vehicle-info", {
    method: "POST",
    body: JSON.stringify({ vehicle_id }),
  });
  const data = await response.json();
  return data || [];
}

export default function Home() {
  // 1. search: 차량번호 검색
  // 2. choice: 차량 리스트 중 하나 선택
  // 3. info: 차량 정보, 운전자 정보, 작업 정보 열람, 선택(운전자, 작업)
  // 4. record: 출입 기록 작성

  // 1) 차량 데이터 여러 개: 1-2-3-4
  // 2) 차량 데이터 한 개: 1-3-4
  // 3) 새로운 차량 or 차량 데이터 없음: 1-4

  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"search" | "choice" | "info" | "record">(
    "search"
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");

  // URL 파라미터에서 모드 확인
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "search" || !urlMode) {
      setMode("search");
      setVehicles([]);
      setVehicleInfo(null);
      setDrivers([]);
      setDriverInfo(null);
      setAlertMessage("");
    }
  }, [searchParams]);

  // 모드 변경 시 URL 업데이트
  const updateMode = (newMode: "search" | "choice" | "info" | "record") => {
    setMode(newMode);
    if (newMode === "search") {
      router.replace("/");
    } else {
      router.replace(`/?mode=${newMode}`);
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    console.log("뒤로 가기!");
    if (mode === "choice") {
      updateMode("search");
      setVehicles([]);
      return;
    } else if (mode === "info") {
      if (vehicles.length > 1) {
        updateMode("choice");
        return;
      } else if (vehicles.length === 1) {
        updateMode("search");
        setDriverInfo(null);
        return;
      }
    } else if (mode === "record") {
      if (!vehicleInfo && vehicles.length === 0) {
        updateMode("search");
        return;
      } else if (!vehicleInfo) {
        updateMode("choice");
        return;
      }
      updateMode("info");
      return;
    }
  };

  // 1. 차량 번호 검색 -> 차량 데이터
  const handleSearch = async (plateNumber: string) => {
    if (plateNumber.length === 0) {
      updateMode("record");
      setAlertMessage("새로운 정보를 입력해주세요!");
      setVehicles([]);
      setVehicleInfo(null);
      setDrivers([]);
      setDriverInfo(null);
      return;
    }
    const { data } = await searchVehicles(plateNumber);

    if (data.length === 1) {
      // 차량 데이터가 1개일 때
      // - 차량 번호가 완전히 일치할 때 -> info 모드
      // - 차량 번호가 일치하지 않을 때 -> record 모드
      if (plateNumber.length === 4) {
        const { data: driverData } = await searchDrivers(data[0].id);
        setVehicles(data);
        setVehicleInfo(data[0]);
        setDrivers(driverData || []);
        updateMode("info");
        return;
      } else {
        updateMode("record");
        setAlertMessage("일치하는 정보가 없습니다.");
      }
    } else if (data.length > 1) {
      // 차량 데이터가 여러 개일 때
      setVehicles(data);
      setVehicleInfo(null);
      setDrivers([]);
      updateMode("choice");
      return;
    } else {
      // 차량 데이터가 없을 때
      setVehicles([]);
      setVehicleInfo(null);
      setDrivers([]);
      updateMode("record");
      return;
    }
  };

  // 2. 차량 선택 -> 차량 정보
  const handleChoice = async (vehicleId: string | null) => {
    if (vehicleId) {
      // 선택된 차량의 정보와 운전자 정보를 가져옴
      const { data: vehicleInfoData } = await searchVehicleInfo(vehicleId);
      const { data: driversData } = await searchDrivers(vehicleId);
      setVehicleInfo(vehicleInfoData[0]);
      setDrivers(driversData || null);
      updateMode("info");
    } else {
      setVehicleInfo(null);
      setDrivers([]);
      setDriverInfo(null);
      updateMode("record");
    }
  };

  // 3. 출입 기록
  const handleRecord = async (vehicleId: string) => {
    const { data: vehicleInfoData } = await searchVehicleInfo(vehicleId);
    setVehicleInfo(vehicleInfoData[0]);
    updateMode("record");
  };

  // 4. 기록 DB 저장
  const handleSaveRecord = async (recordData: RecordData) => {
    try {
      const response = await fetch("/api/save-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicle_id: vehicleInfo?.id || null,
          person_id: driverInfo?.id || null,
          work_id: null, // 작업 정보는 나중에 추가
          raw_plate_number: recordData.plateNumber.trim(),
          raw_vehicle_type: recordData.carType.trim(),
          raw_person_name: recordData.driverName.trim(),
          raw_person_phone: recordData.driverNumber.trim(),
          driver_organization: recordData.driverAffiliation.trim(),
          passengers: recordData.companion.trim(),
          purpose: recordData.visitPurpose.trim(),
          notes: recordData.note.trim(),
          is_free_pass: vehicleInfo?.is_free_pass_enabled || false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "저장 중 오류가 발생했습니다.");
      }

      alert("출입 기록이 성공적으로 저장되었습니다.");
      updateMode("search"); // 저장 후 검색 화면으로 돌아가기
      setAlertMessage("");
    } catch (error) {
      console.error("저장 오류:", error);
      alert(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <>
      {mode === "search" && (
        <>
          <Header title="차량 검색" onHomeClick={() => updateMode("search")} />
          <main className="mx-6 pb-24">
            <Keypad onSearch={handleSearch} />
          </main>
        </>
      )}
      {mode === "choice" && (
        <>
          <Header
            back={true}
            title="차량 선택"
            onBack={handleBack}
            onHomeClick={() => updateMode("search")}
          />
          <main className="mx-6 pb-24">
            <VehicleChoice onChoice={handleChoice} data={vehicles} />
          </main>
        </>
      )}
      {mode === "info" && (
        <>
          <Header
            back={true}
            title="차량 정보"
            onBack={handleBack}
            onHomeClick={() => updateMode("search")}
          />
          <main className="mx-6 pb-24">
            <Info
              vehicleData={vehicleInfo}
              driverData={drivers}
              onRecord={handleRecord}
              onSetDriverInfo={setDriverInfo}
            />
          </main>
        </>
      )}
      {mode === "record" && (
        <>
          <Header
            back={true}
            title="출입 기록"
            onBack={handleBack}
            onHomeClick={() => updateMode("search")}
          />
          <main className="mx-6 pb-24">
            <Record
              vehicleData={vehicleInfo}
              driverData={driverInfo}
              onSaveRecord={handleSaveRecord}
              alertMessage={alertMessage}
            />
          </main>
        </>
      )}
    </>
  );
}
