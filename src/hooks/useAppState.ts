import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Driver, Vehicle } from "@/types";

export type AppMode = "search" | "choice" | "info" | "record";

export function useAppState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AppMode>("search");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");

  // 새로고침 감지 및 URL 초기화
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("shouldReset", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const shouldReset = sessionStorage.getItem("shouldReset");
    if (shouldReset === "true" && window.location.search !== "") {
      sessionStorage.removeItem("shouldReset");
      router.replace("/");
      setMode("search");
      setVehicles([]);
      setVehicleInfo(null);
      setDrivers([]);
      setDriverInfo(null);
      setAlertMessage("");
      return;
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router]);

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
  const updateMode = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === "search") {
      router.push("/");
    } else {
      router.push(`/?mode=${newMode}`);
    }
  };

  // 상태 초기화
  const resetState = () => {
    setVehicles([]);
    setVehicleInfo(null);
    setDrivers([]);
    setDriverInfo(null);
    setAlertMessage("");
  };

  return {
    mode,
    vehicles,
    vehicleInfo,
    drivers,
    driverInfo,
    alertMessage,
    setVehicles,
    setVehicleInfo,
    setDrivers,
    setDriverInfo,
    setAlertMessage,
    updateMode,
    resetState,
  };
}
