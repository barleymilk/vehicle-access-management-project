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
