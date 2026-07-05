export interface Device {
  id: string;
  device_id: string;
  serial_number: string;
  owner_type: "user" | "hospital";
  owner_id: string;
  patient_id: string | null;
  location: { lat: number; lng: number };
  battery: number;
  signal_strength: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface DeviceRegister {
  serial_number: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface DeviceLocationUpdate {
  lat: number;
  lng: number;
}

export interface DeviceStatusUpdate {
  status: "active" | "inactive";
}