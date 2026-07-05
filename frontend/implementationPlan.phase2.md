# Phase 2: User & Device Management — Frontend Implementation Plan

## Overview

Frontend integration for Phase 2: User & Device Management. Wire pages to backend API with mock data served when USE_MOCK_DATA=true.

## Configuration

- Backend USE_MOCK_DATA flag controls data source
- When false: real MongoDB queries
- When true: returns mock from backend

## TypeScript Interfaces

Create src/types/:

### src/types/patient.ts
```typescript
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
```

### src/types/device.ts
```typescript
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
```

### src/types/alert.ts
```typescript
export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  type: AlertType;
  severity: VitalStatus;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  district: string;
}
```

## React Query Hooks

Create src/hooks/:

### src/hooks/usePatient.ts
- usePatients(params?)
- usePatient(id)
- useOwnPatient()
- useCreatePatient()
- useUpdatePatient(id)
- useBindDevice(patientId)
- useUnbindDevice(patientId)

### src/hooks/useDevice.ts
- useDevices()
- useDevice(id)
- useRegisterDevice()
- useUpdateDeviceLocation(id)
- useUpdateDeviceStatus(id)

### src/hooks/useAlert.ts
- useAlerts(params?)
- useAlert(id)
- useAcknowledgeAlert(id)

## Page Migration

| Page | Current | Target | Change |
|------|---------|--------|--------|
| Dashboard.tsx | mockData | GET /patients | usePatients() |
| PatientList.tsx | mockData | GET /patients | usePatients() |
| PatientDetail.tsx | mockData | GET /patients/{id} | usePatient(id) |
| AlertHistory.tsx | mockData | GET /alerts | useAlerts() |
| EmergencyResponse.tsx | mockData | GET /alerts/{id} | useAlert(id) |
| Users.tsx | hardcoded | GET /account | admin query |
| AdminMonitoring.tsx | mockData | GET /devices + /patients | useDevices() + usePatients() |

## Files to Create

1. src/types/patient.ts
2. src/types/device.ts
3. src/types/alert.ts
4. src/hooks/usePatient.ts
5. src/hooks/useDevice.ts
6. src/hooks/useAlert.ts

## Files to Modify

1. src/pages/Dashboard.tsx
2. src/pages/PatientList.tsx
3. src/pages/PatientDetail.tsx
4. src/pages/AlertHistory.tsx
5. src/pages/EmergencyResponse.tsx
6. src/pages/Users.tsx
7. src/pages/admin/AdminMonitoring.tsx

## Post-Migration Cleanup

After all pages wired and USE_MOCK_DATA=true:
- Delete src/data/mockData.ts (move to trash)
- Delete src/data/trendData.ts (keep until Phase 4)

## Execution Order

1. Create types (patient.ts, device.ts, alert.ts)
2. Create hooks (usePatient.ts, useDevice.ts, useAlert.ts)
3. Wire PatientList.tsx
4. Wire PatientDetail.tsx
5. Wire Dashboard.tsx
6. Wire AlertHistory.tsx
7. Wire EmergencyResponse.tsx
8. Wire Users.tsx
9. Wire AdminMonitoring.tsx
10. Run npm run lint
11. Run npm run build

---

# Phase 3: Hospital System — Frontend Implementation Plan

## Remaining Work

### Phase 2 Cleanup (independent tasks)

| # | File | What to do |
|---|------|------------|
| 1 | AppSidebar.tsx | Replace `alerts` from `mockData` with `useAlerts()` hook for the unacknowledged badge count |
| 2 | EmergencyResponse.tsx | Remove mockData fallback imports; the hooks already work |
| 3 | AccountLockout.tsx | Remove mockData imports (replace with hardcoded static display or API data) |

### Phase 3 Foundation (needed by admin pages)

| # | File | What to do |
|---|------|------------|
| 4 | `src/types/hospital.ts` | Create — `Hospital`, `HospitalBrief`, `HospitalCreate`, `HospitalUpdate`, `LicenseUpdate` |
| 5 | `src/types/hospitalStaff.ts` | Create — `HospitalStaff`, `StaffAssign`, `StaffPatientsUpdate` |
| 6 | `src/hooks/useHospital.ts` | Create — `useHospitals()`, `useHospital(id)`, `useCreateHospital()`, `useUpdateHospital()`, `useUpdateLicenseStatus()` |
| 7 | `src/hooks/useHospitalStaff.ts` | Create — `useHospitalStaff(hospitalId)`, `useAssignStaff()`, `useRemoveStaff()`, `useMyHospitals()`, `useUpdateStaffPatients()` |
| 8 | `src/hooks/useDevice.ts` | Add `useAssignDevice()` mutation for `PUT /devices/{id}/assign` |
| 9 | `src/hooks/useAdmin.ts` | Create — `useAdminUpdateAccount()` for `PUT /account/{id}` |

### Phase 3 Admin Pages (wired to API)

| # | File | What to do |
|---|------|------------|
| 10 | AdminLogin.tsx | Replace hardcoded credentials with real `POST /auth/login` + role check via `GET /account/me` |
| 11 | AdminDashboard.tsx | Replace `hospitalStore` with `useHospitals()`, `useUpdateLicenseStatus()`, remove local mrrTrend constant |
| 12 | AdminHospitalDetail.tsx | Replace `hospitalStore` with `useHospital(id)`, `useDevices()`, `useHospitalStaff(id)`; invoice tab → "Coming Soon" |
| 13 | AdminInvoices.tsx | Add "Coming Soon" placeholder content |
| 14 | AdminMonitoring.tsx | Remove mockData padding — already has `usePatients()` and `useDevices()`; add `useHospitals()` for hospital filter |

### Users.tsx (Phase 2)

| # | File | What to do |
|---|------|------------|
| 15 | Users.tsx | Wire to `useHospitalStaff(hospitalId)` for listing/removing staff; add `useAssignStaff()` for adding staff |

### Store Cleanup

| # | File | What to do |
|---|------|------------|
| 16 | hospitalStore.ts | Move to `trash/stores/hospitalStore.ts` after all consumers migrated |
| 17 | licenseStore.ts | Refactor to use `useHospital(id)` (TanStack Query) instead of reading from `hospitalStore`; update `GracePeriodBanner` if needed |
| 18 | mockData.ts | Move to `trash/data/mockData.ts` after all consumers are clean |

### Verification

| # | Command |
|---|---------|
| 19 | `npm run lint` (or `npx tsc --noEmit` if lint is broken) |
| 20 | `npm run build` |

## Dependencies

```
Phase 2 Cleanup (1-3) ──────┐  independent, can do in parallel
                              │
Foundation (4-9) ────────────┼── needed by Admin Pages (10-14) and Users (15)
                              │
Admin Pages (10-14) ─────────┤  depend on Foundation
Users (15) ──────────────────┤  depends on Foundation
                              │
Store Cleanup (16-18) ───────┘  depends on all consumers migrated
```

## Execution Order

### Phase 2 Cleanup (steps 1-3)
1. AppSidebar.tsx — switch alert badge to useAlerts()
2. EmergencyResponse.tsx — remove mockData fallback
3. AccountLockout.tsx — remove mockData imports

### Phase 3 Foundation (steps 4-9)
4. Create src/types/hospital.ts
5. Create src/types/hospitalStaff.ts
6. Create src/hooks/useHospital.ts
7. Create src/hooks/useHospitalStaff.ts
8. Add useAssignDevice() to useDevice.ts
9. Create src/hooks/useAdmin.ts

### Phase 3 Pages + Users (steps 10-15)
10. AdminLogin.tsx — real role-based auth
11. AdminDashboard.tsx — wire to hooks
12. AdminHospitalDetail.tsx — wire to hooks
13. AdminInvoices.tsx — "Coming Soon"
14. AdminMonitoring.tsx — remove mockData padding
15. Users.tsx — wire to hospitalStaff hooks

### Cleanup (steps 16-18)
16. Move hospitalStore.ts to trash
17. Refactor licenseStore.ts
18. Move mockData.ts to trash

### Verify (steps 19-20)
19. npx tsc --noEmit
20. npm run build
