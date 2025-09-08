import { VehicleModalData } from "@/types";

export const VEHICLE_MODAL_DATA: VehicleModalData = {
  title: "차량",
  photo: {
    attribute: "photo_path",
    label: "사진",
    placeholder: "사진",
    type: "photo",
    value: "/car.webp",
    defaultValue: "/car.webp",
  },
  fields: [
    {
      attribute: "plate_number",
      label: "차량번호",
      placeholder: "1234가1234",
      type: "text",
      required: true,
      defaultValue: "",
    },
    {
      attribute: "vehicle_type",
      label: "차량종류",
      placeholder: "차량종류",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "is_public_vehicle",
      label: "공용여부",
      placeholder: "공용",
      type: "boolean",
      defaultValue: false,
      dataPair: {
        true: "공용 차량",
        false: "개인 차량",
      },
      required: true,
    },
    {
      attribute: "owner_department",
      label: "부서명",
      placeholder: "부서명",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "access_start_date",
      label: "접근 시작일",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "access_start_date",
        endDateField: "access_end_date",
      },
    },
    {
      attribute: "access_end_date",
      label: "접근 종료일",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "access_start_date",
        endDateField: "access_end_date",
      },
    },
    {
      attribute: "is_free_pass_enabled",
      label: "프리패스",
      type: "boolean",
      defaultValue: false,
      dataPair: {
        true: "프리패스 O",
        false: "프리패스 X",
      },
      required: true,
    },
    {
      attribute: "special_notes",
      label: "특이사항",
      placeholder: "특이사항",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "status",
      label: "상태",
      type: "select",
      defaultValue: "active",
      dataPair: {
        active: "활성",
        inactive: "비활성",
        blocked: "차단",
      },
      required: true,
    },
  ],
};
