// API 호출 함수: 차량 번호 -> 차량 리스트
export async function searchVehicles(plate_number: string) {
  const response = await fetch("/api/search-vehicles", {
    method: "POST",
    body: JSON.stringify({ plate_number }),
  });
  const data = await response.json();
  return data || [];
}

// API 호출 함수: 차량 ID -> 운전자 리스트
export async function searchDrivers(vehicle_id: string) {
  console.log("@searchDrivers > vehicle_id:", vehicle_id);
  const response = await fetch("/api/search-drivers", {
    method: "POST",
    body: JSON.stringify({ vehicle_id }),
  });
  const data = await response.json();
  return data || [];
}

// API 호출 함수: 차량 ID -> 차량 정보
export async function searchVehicleInfo(vehicle_id: string) {
  console.log("@searchVehicleInfo > vehicle_id:", vehicle_id);
  const response = await fetch("/api/search-vehicle-info", {
    method: "POST",
    body: JSON.stringify({ vehicle_id }),
  });
  const data = await response.json();
  return data || [];
}

// API 호출 함수: 출입 기록 저장
export async function saveRecord(recordData: {
  vehicle_id: string | null;
  person_id: string | null;
  work_id: string | null;
  raw_plate_number: string;
  raw_vehicle_type: string;
  raw_person_name: string;
  raw_person_phone: string;
  driver_organization: string;
  passengers: string;
  purpose: string;
  notes: string;
  is_free_pass: boolean;
}) {
  const response = await fetch("/api/save-record", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recordData),
  });
  const data = await response.json();
  return { response, data };
}
