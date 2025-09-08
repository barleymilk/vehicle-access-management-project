export type BadgeVariant =
  | "destructive"
  | "default"
  | "secondary"
  | "outline"
  | "success";

export interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type: string;
  is_public_vehicle: boolean;
  access_start_date: string;
  access_end_date: string;
  special_notes: string;
  is_free_pass_enabled: boolean;
}

export interface Driver {
  id: string;
  name: string;
  organization: string;
  department: string;
  position: string;
  phone_number: string;
  activity_start_date: string;
  activity_end_date: string;
  contact_person_name: string;
  contact_person_phone: string;
  vip_level: string;
  org_dept_pos: string;
}

export interface RecordData {
  plateNumber: string;
  driverName: string;
  carType: string;
  driverNumber: string;
  driverAffiliation: string;
  companion: string;
  visitPurpose: string;
  note: string;
}

export interface InfoItem {
  label: string;
  value: string;
  tags?: TagInfo | null;
}

export interface TagInfo {
  text: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success";
}

// CommonModal용 필드 타입 정의
export type FieldType = "text" | "boolean" | "date" | "select" | "photo";

export interface DataPair {
  [key: string]: string;
}

export interface DatePair {
  startDateField: string;
  endDateField: string;
}

export interface ModalField {
  attribute: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  defaultValue: string | boolean;
  dataPair?: DataPair;
  datePair?: DatePair;
  autoGenerate?: (formData: Record<string, unknown>) => unknown;
}

export interface ModalPhoto {
  attribute: string;
  label: string;
  placeholder: string;
  type: "photo";
  value: string;
  defaultValue: string;
}

export interface ModalData {
  title: string;
  photo: ModalPhoto;
  fields: ModalField[];
}

// 차량 모달 데이터 타입
export type VehicleModalData = ModalData;

// 인물 모달 데이터 타입
export type PeopleModalData = ModalData;
