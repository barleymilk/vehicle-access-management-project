import { useState } from "react";
import { Driver, Vehicle } from "@/types";
import { InputField } from "@/components/ui/input-field";
import { FixedBottomButton } from "@/components/ui/fixed-bottom-button";

export const Record = ({
  vehicleData = null,
  driverData = null,
}: {
  vehicleData: Vehicle | null;
  driverData: Driver | null;
}) => {
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

  const recordData = [
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
      {recordData.map((item) => (
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
      <FixedBottomButton>저장하기</FixedBottomButton>
    </>
  );
};
