"use client";

import { Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";
import { Keypad } from "@/components/ui/keypad";
import { VehicleChoice } from "@/app/_components/VehicleChoice";
import { Info } from "@/app/_components/Info";
import { Record } from "@/app/_components/Record";
import { LoadingOverlay } from "@/components/ui/loading";
import { useAppLogic } from "@/hooks/useAppLogic";

function HomePageContent() {
  const {
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
  } = useAppLogic();

  return (
    <ProtectedRoute>
      <>
        {isLoading && <LoadingOverlay message="데이터를 불러오는 중..." />}

        {mode === "search" && (
          <>
            <Header title="차량 검색" onHomeClick={() => handleBackLogic()} />
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
              onBack={handleBackLogic}
              onHomeClick={() => handleBackLogic()}
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
              onBack={handleBackLogic}
              onHomeClick={() => handleBackLogic()}
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
              onBack={handleBackLogic}
              onHomeClick={() => handleBackLogic()}
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
    </ProtectedRoute>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
