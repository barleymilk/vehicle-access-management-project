"use client";

import Header from "@/components/Header";
import { Keypad } from "@/components/ui/keypad";
import { VehicleChoice } from "@/app/_components/VehicleChoice";
import { Info } from "@/app/_components/Info";
import { Record } from "@/app/_components/Record";
import { useAppLogic } from "@/hooks/useAppLogic";

export default function Home() {
  const {
    mode,
    vehicles,
    vehicleInfo,
    drivers,
    driverInfo,
    alertMessage,
    handleSearch,
    handleChoice,
    handleRecord,
    handleSaveRecord,
    handleBackLogic,
    setDriverInfo,
  } = useAppLogic();

  return (
    <>
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
  );
}
