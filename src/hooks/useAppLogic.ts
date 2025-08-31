import { useEffect, useCallback } from "react";
import {
  searchVehicles,
  searchDrivers,
  searchVehicleInfo,
  saveRecord,
} from "@/lib/api";
import { useAppState } from "./useAppState";
import { RecordData } from "@/types";

export function useAppLogic() {
  const {
    mode,
    vehicles,
    vehicleInfo,
    drivers,
    driverInfo,
    alertMessage,
    isLoading,
    setVehicles,
    setVehicleInfo,
    setDrivers,
    setDriverInfo,
    setAlertMessage,
    setIsLoading,
    updateMode,
    resetState,
  } = useAppState();

  // 뒤로가기 로직 (공통 함수)
  const handleBackLogic = useCallback(() => {
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
  }, [mode, vehicles, vehicleInfo, updateMode, setVehicles, setDriverInfo]);

  // 브라우저 뒤로가기 이벤트 감지
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      if (mode !== "search") {
        handleBackLogic();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handleBackLogic]);

  // 1. 차량 번호 검색 -> 차량 데이터
  const handleSearch = async (plateNumber: string) => {
    setIsLoading(true);
    try {
      if (plateNumber.length === 0) {
        updateMode("record");
        setAlertMessage("새로운 정보를 입력해주세요!");
        resetState();
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
          setAlertMessage("일치하는 차량이 없습니다.");
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
        resetState();
        updateMode("record");
        setAlertMessage("일치하는 차량이 없습니다.");
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 차량 선택 -> 차량 정보
  const handleChoice = async (vehicleId: string | null) => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 출입 기록
  const handleRecord = async (vehicleId: string) => {
    setIsLoading(true);
    try {
      const { data: vehicleInfoData } = await searchVehicleInfo(vehicleId);
      setVehicleInfo(vehicleInfoData[0]);
      updateMode("record");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 기록 DB 저장
  const handleSaveRecord = async (recordData: RecordData) => {
    setIsLoading(true);
    try {
      const { response, data } = await saveRecord({
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
      });

      if (!response.ok) {
        throw new Error(data.error || "저장 중 오류가 발생했습니다.");
      }

      alert("출입 기록이 성공적으로 저장되었습니다.");
      updateMode("search"); // 저장 후 검색 화면으로 돌아가기
      setAlertMessage("");
    } catch (error) {
      console.error("저장 오류:", error);
      alert(
        error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mode,
    vehicles,
    vehicleInfo,
    drivers,
    driverInfo,
    alertMessage,
    isLoading,
    handleSearch,
    handleChoice,
    handleRecord,
    handleSaveRecord,
    handleBackLogic,
    setDriverInfo,
  };
}
