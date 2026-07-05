export interface HospitalStaff {
  account_id: string;
  hospital_id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  assigned_patients: string[];
  created_at: string;
}

export interface StaffAssign {
  account_id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  hospital_id?: string | null;
}

export interface StaffPatientsUpdate {
  assigned_patients: string[];
}
