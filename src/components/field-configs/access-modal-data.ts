import { ModalData } from "@/types";

export const ACCESS_MODAL_DATA: ModalData = {
  title: "출입 기록",
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
      attribute: "raw_plate_number",
      label: "차량번호",
      placeholder: "01가1234 (혹은 기타)",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "raw_vehicle_type",
      label: "차량종류",
      placeholder: "SUV",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "raw_person_name",
      label: "운전자명",
      placeholder: "홍길동",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "driver_organization",
      label: "운전자 소속",
      placeholder: "소속",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "raw_person_phone",
      label: "운전자 번호",
      placeholder: "숫자만 입력",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "passengers",
      label: "동승자",
      placeholder: "동승자명",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "purpose",
      label: "방문목적",
      placeholder: "업무/방문",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "notes",
      label: "특이사항",
      placeholder: "특이사항",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "entered_at",
      label: "입차시간",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "entered_at",
        endDateField: "exited_at",
      },
    },
    {
      attribute: "exited_at",
      label: "출차시간",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "entered_at",
        endDateField: "exited_at",
      },
    },
  ],
};
