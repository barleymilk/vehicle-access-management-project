import { useState } from "react";
import { Driver, Vehicle, RecordData } from "@/types";
import { InputField } from "@/components/ui/input-field";
import { FixedBottomButton } from "@/components/ui/fixed-bottom-button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { validatePlateNumber } from "@/lib/utils";
import { CheckCircle2Icon } from "lucide-react";

export const Record = ({
  vehicleData = null,
  driverData = null,
  onSaveRecord,
  alertMessage = null,
}: {
  vehicleData: Vehicle | null;
  driverData: Driver | null;
  onSaveRecord: (recordData: RecordData) => Promise<void>;
  alertMessage: string | null;
}) => {
  // console.log("Record > vehicleData:", vehicleData);
  // console.log("Record > driverData:", driverData);
  const [formData, setFormData] = useState({
    plate_number: vehicleData?.plate_number || "",
    vehicle_type: vehicleData?.vehicle_type || "",
    driver_name: driverData?.name || "",
    driver_org_dept_pos: driverData?.org_dept_pos || "",
    driver_phone_number: driverData?.phone_number || "",
    passenger: "",
    purpose: "",
    special_notes: "",
  });

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleClear = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleSave = async () => {
    // 차량번호 형식 검증
    const plateValidation = validatePlateNumber(formData.plate_number);
    if (!plateValidation.isValid) {
      alert(plateValidation.message);
      return;
    }

    // 필수 필드 검증
    if (!formData.driver_name.trim()) {
      alert("운전자명을 입력해주세요.");
      return;
    }

    try {
      await onSaveRecord({
        plateNumber: formData.plate_number,
        driverName: formData.driver_name,
        carType: formData.vehicle_type,
        driverNumber: formData.driver_phone_number,
        driverAffiliation: formData.driver_org_dept_pos,
        companion: formData.passenger,
        visitPurpose: formData.purpose,
        note: formData.special_notes,
      });
    } catch (error) {
      // 에러는 onSaveRecord에서 처리됨
      console.error("저장 오류:", error);
    }
  };

  const formFields = [
    {
      id: "plate_number",
      label: "차량번호",
      value: formData.plate_number,
      required: true,
      disabled: vehicleData?.id ? true : false,
      type: "text",
      placeholder: "01가1234 또는 기타",
    },
    {
      id: "vehicle_type",
      label: "차량종류",
      value: formData.vehicle_type,
      required: false,
      disabled: vehicleData?.id ? true : false,
      type: "text",
      placeholder: "SUV, 앰뷸런스 등",
    },
    {
      id: "driver_name",
      label: "운전자명",
      value: formData.driver_name,
      required: true,
      disabled: driverData?.id ? true : false,
      type: "text",
      placeholder: "이름",
    },
    {
      id: "driver_org_dept_pos",
      label: "운전자소속",
      value: formData.driver_org_dept_pos,
      required: false,
      disabled: driverData?.id ? true : false,
      type: "text",
      placeholder: "소속",
    },
    {
      id: "driver_phone_number",
      label: "운전자번호",
      value: formData.driver_phone_number,
      required: false,
      disabled: driverData?.id ? true : false,
      type: "text",
      placeholder: "번호",
    },
    {
      id: "passenger",
      label: "동승자",
      value: formData.passenger,
      required: false,
      type: "text",
      placeholder: "동승자",
    },
    {
      id: "purpose",
      label: "방문목적",
      value: formData.purpose,
      required: false,
      type: "text",
      placeholder: "방문목적",
    },
    {
      id: "special_notes",
      label: "특이사항",
      value: formData.special_notes,
      required: false,
      type: "text",
      placeholder: "특이사항",
    },
  ];

  return (
    <>
      {alertMessage && (
        <Alert className="mt-4 bg-[var(--muted)]">
          <CheckCircle2Icon />
          <AlertTitle>{alertMessage}</AlertTitle>
        </Alert>
      )}
      {formFields.map((item) => (
        <InputField
          key={item.id}
          id={item.id}
          label={item.label}
          value={item.value}
          placeholder={item.placeholder}
          required={item.required}
          disabled={item.disabled}
          type={item.type as "text" | "number" | "email" | "tel"}
          onChange={(value) => handleInputChange(item.id, value)}
          onClear={() => handleClear(item.id)}
        />
      ))}
      <FixedBottomButton onClick={handleSave}>저장하기</FixedBottomButton>
    </>
  );
};
