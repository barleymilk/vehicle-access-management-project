import { FieldConfig } from "@/components/AddModal";
import { DatePairConfig } from "@/lib/utils";

export const peopleFields: FieldConfig[] = [
  {
    id: "name",
    label: "이름",
    placeholder: "이름을 입력하세요",
    type: "text",
    isInput: true,
    isSelect: false,
    required: true,
  },
  {
    id: "organization",
    label: "소속",
    placeholder: "소속을 입력하세요",
    type: "text",
    isInput: true,
    isSelect: false,
    required: false,
  },
  {
    id: "department",
    label: "부서",
    placeholder: "부서를 입력하세요",
    type: "text",
    isInput: true,
    isSelect: false,
    required: false,
  },
  {
    id: "position",
    label: "직급",
    placeholder: "직급을 입력하세요",
    type: "text",
    isInput: true,
    isSelect: false,
    required: false,
  },
  {
    id: "org_dept_pos",
    label: "소속/부서/직급",
    placeholder: "자동 생성됩니다",
    type: "text",
    isInput: false,
    isSelect: false,
    required: false,
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
    id: "phone_number",
    label: "전화번호",
    placeholder: "전화번호를 입력하세요",
    type: "text",
    isInput: true,
    isSelect: false,
    required: false,
  },
  {
    id: "vip_level",
    label: "VIP 레벨",
    placeholder: "VIP 레벨을 선택하세요",
    type: "text",
    isInput: false,
    isSelect: true,
    options: [
      { value: "VIP1", label: "VIP1" },
      { value: "VIP2", label: "VIP2" },
      { value: "VIP3", label: "VIP3" },
      { value: "직원", label: "직원" },
      { value: "대내기관", label: "대내기관" },
      { value: "외부업체", label: "외부업체" },
      { value: "단체방문", label: "단체방문" },
      { value: "일반", label: "일반" },
    ],
    defaultValue: "일반",
    required: true,
  },
  {
    id: "is_worker",
    label: "외부용역",
    placeholder: "외부용역을 선택하세요",
    type: "boolean",
    isInput: false,
    isSelect: true,
    required: false,
    options: [
      { value: "false", label: "외부 용역 X" },
      { value: "true", label: "외부 용역 O" },
    ],
    defaultValue: "false",
  },
  {
    id: "status",
    label: "상태",
    placeholder: "상태를 선택하세요",
    type: "text",
    isInput: false,
    isSelect: true,
    required: false,
    options: [
      { value: "active", label: "활성" },
      { value: "inactive", label: "비활성" },
      { value: "blocked", label: "차단" },
    ],
    defaultValue: "active",
  },
  {
    id: "activity_start_date",
    label: "활동 시작일",
    placeholder: "활동 시작일을 선택하세요",
    type: "date",
    isInput: false,
    isSelect: false,
    required: false,
    datePair: {
      startDateField: "activity_start_date",
      endDateField: "activity_end_date",
    } as DatePairConfig,
  },
  {
    id: "activity_end_date",
    label: "활동 종료일",
    placeholder: "활동 종료일을 선택하세요",
    type: "date",
    isInput: false,
    isSelect: false,
    required: false,
    datePair: {
      startDateField: "activity_start_date",
      endDateField: "activity_end_date",
    } as DatePairConfig,
  },
  {
    id: "photo_path",
    label: "사진",
    placeholder: "사진을 선택하세요",
    type: "file",
    isInput: false,
    isSelect: false,
    required: false,
  },
];
