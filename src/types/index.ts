export type BadgeVariant =
  | "destructive"
  | "default"
  | "secondary"
  | "outline"
  | "success";

export interface TagInfo {
  text: string;
  variant: BadgeVariant;
}

export interface InfoItem {
  label: string;
  value: string;
  tags?: TagInfo | null;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type: string;
  is_public_vehicle: boolean;
  owner_department: string | null;
  access_start_date: string | null;
  access_end_date: string | null;
  is_free_pass_enabled: boolean;
  special_notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone_number: string;
  organization: string;
  department: string | null;
  position: string | null;
  org_dept_pos: string | null;
  photo_path: string | null;
  vip_level: string;
  is_worker: boolean;
  activity_start_date: string | null;
  activity_end_date: string | null;
  contact_person_name: string | null;
  contact_person_phone: string | null;
  status: string;
}
