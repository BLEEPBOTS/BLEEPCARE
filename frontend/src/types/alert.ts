import { VitalStatus } from "./patient";

export type AlertType =
  | "heart_rate"
  | "spo2"
  | "temperature"
  | "respiratory"
  | "fall_detected"
  | "sos_button";

export type AlertSeverity = VitalStatus;

export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  district: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlertAcknowledge {}