export type VitalStatus = "normal" | "warning" | "critical";

export interface Vital {
  heart_rate: number;
  spo2: number;
  temperature: number;
  timestamp: string;
}

export interface Patient {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  district: string | null;
  home_address: string | null;
  phone: string | null;
  diagnosis: string | null;
  admitted_date: string | null;
  discharge_date: string | null;
  status: VitalStatus;
  current_vitals: Vital | null;
  vitals_history: Vital[];
  assigned_nurse: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  device_id: string | null;
  device_battery: number | null;
  signal_strength: number | null;
  fall_detected: boolean;
  sos_pressed: boolean | null;
  gps_lat: number | null;
  gps_lng: number | null;
  account_id?: string;
}

export interface PatientBrief {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  district: string | null;
  status: VitalStatus;
  diagnosis: string | null;
  device_id: string | null;
  device_battery: number | null;
  signal_strength: number | null;
  fall_detected: boolean;
}

export interface PatientCreate {
  diagnosis?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  assigned_nurse?: string;
}

export interface PatientUpdate {
  diagnosis?: string;
  discharged_date?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  assigned_nurse?: string;
}

export interface BindDevice {
  device_id: string;
}