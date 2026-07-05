export type Plan = "Premium" | "Standard" | "Trial";
export type LicenseStatus = "active" | "grace_period" | "suspended" | "trial";

export interface Hospital {
  id: string;
  hospital_id: string;
  name: string;
  district: string;
  plan: Plan;
  license_status: LicenseStatus;
  mrr: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  license_key: string;
  max_patients: number;
  max_devices: number;
  license_activated: string;
  license_expires: string;
  patients_count: number;
  devices_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalCreate {
  name: string;
  district: string;
  plan: Plan;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  max_patients: number;
  max_devices: number;
  mrr?: number;
}

export interface HospitalUpdate {
  name?: string | null;
  district?: string | null;
  plan?: Plan | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  max_patients?: number | null;
  max_devices?: number | null;
  mrr?: number | null;
}

export interface LicenseUpdate {
  license_status: LicenseStatus;
}
