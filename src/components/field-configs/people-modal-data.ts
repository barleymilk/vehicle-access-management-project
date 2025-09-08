import { PeopleModalData } from "@/types";

export const PEOPLE_MODAL_DATA: PeopleModalData = {
  title: "인물",
  photo: {
    attribute: "photo_path",
    label: "사진",
    placeholder: "사진",
    type: "photo",
    value: "/user.webp",
    defaultValue: "/user.webp",
  },
  fields: [
    {
      attribute: "name",
      label: "이름",
      placeholder: "이름을 입력하세요",
      type: "text",
      required: true,
      defaultValue: "",
    },
    {
      attribute: "organization",
      label: "소속",
      placeholder: "소속을 입력하세요",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "department",
      label: "부서",
      placeholder: "부서를 입력하세요",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "position",
      label: "직급",
      placeholder: "직급을 입력하세요",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "org_dept_pos",
      label: "소속/부서/직급",
      placeholder: "자동 생성됩니다",
      type: "text",
      defaultValue: "",
      autoGenerate: (formData: Record<string, unknown>) => {
        const org = formData.organization as string;
        const dept = formData.department as string;
        const pos = formData.position as string;

        const parts = [org, dept, pos].filter(
          (part) => part && typeof part === "string" && part.trim() !== ""
        );

        return parts.length > 0 ? parts.join(" / ") : undefined;
      },
    },
    {
      attribute: "phone_number",
      label: "전화번호",
      placeholder: "전화번호를 입력하세요",
      type: "text",
      defaultValue: "",
    },
    {
      attribute: "vip_level",
      label: "VIP 레벨",
      placeholder: "VIP 레벨을 선택하세요",
      type: "select",
      required: true,
      defaultValue: "일반",
      dataPair: {
        VIP1: "VIP1",
        VIP2: "VIP2",
        VIP3: "VIP3",
        직원: "직원",
        대내기관: "대내기관",
        외부업체: "외부업체",
        단체방문: "단체방문",
        일반: "일반",
      },
    },
    {
      attribute: "is_worker",
      label: "외부용역",
      placeholder: "외부용역을 선택하세요",
      type: "boolean",
      defaultValue: false,
      dataPair: {
        true: "외부용역 O",
        false: "외부용역 X",
      },
    },
    {
      attribute: "status",
      label: "상태",
      placeholder: "상태를 선택하세요",
      type: "select",
      defaultValue: "active",
      dataPair: {
        active: "활성",
        inactive: "비활성",
        blocked: "차단",
      },
    },
    {
      attribute: "activity_start_date",
      label: "활동 시작일",
      placeholder: "활동 시작일을 선택하세요",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "activity_start_date",
        endDateField: "activity_end_date",
      },
    },
    {
      attribute: "activity_end_date",
      label: "활동 종료일",
      placeholder: "활동 종료일을 선택하세요",
      type: "date",
      defaultValue: "",
      datePair: {
        startDateField: "activity_start_date",
        endDateField: "activity_end_date",
      },
    },
  ],
};
