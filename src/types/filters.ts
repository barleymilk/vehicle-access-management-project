export interface SearchFilters {
  plate_number?: string;
  vehicle_type?: string;
  name?: string;
  org_dept_pos?: string;
  phone?: string;
  passengers?: string;
  purpose?: string;
  notes?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface VehicleFilters {
  plate_number?: string;
  vehicle_type?: string;
  is_public_vehicle?: boolean;
  owner_department?: string;
  is_free_pass_enabled?: boolean;
  special_notes?: string;
  status?: string;
  access_start_date?: Date;
  access_end_date?: Date;
}
