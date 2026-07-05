# Frontend — BleepCare Dashboard

React SPA for caregivers, hospital staff, and admins to monitor patients, manage devices, and respond to alerts.

## Tech Stack

- React 18 + TypeScript
- Vite 5 (build tool)
- shadcn/ui (Radix primitives + Tailwind)
- Tailwind CSS v3
- TanStack Query v5 (server state)
- react-router-dom v6 (routing)
- react-leaflet (map)
- recharts (charts)
- zustand (client state)
- better-auth (auth client)
- vitest + Playwright (testing)

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

| Var | Required | Default | Description |
|-----|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:3500` | Backend API base URL (without `/api`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |

## Project Structure

```
src/
├── components/
│   ├── ui/            # shadcn components (button, card, dialog, sheet, etc.)
│   ├── roleDashboards/
│   ├── AppSidebar.tsx
│   ├── CaregiverMap.tsx
│   ├── DashboardLayout.tsx
│   ├── SideBarOptions.tsx
│   └── ...
├── lib/
│   ├── api.ts         # fetch wrapper
│   ├── auth-client.ts # better-auth client
│   └── utils.ts       # cn() helper
├── pages/
│   ├── AccountPage.tsx
│   ├── AdminDevices.tsx
│   ├── AdminHospitals.tsx
│   ├── AlertHistory.tsx
│   ├── AllLogs.tsx
│   ├── Dashboard.tsx
│   ├── DeviceAlerts.tsx
│   ├── DeviceInfo.tsx
│   ├── HospitalCaregivers.tsx
│   ├── HospitalPatients.tsx
│   ├── PatientDetail.tsx
│   └── ...
├── types/
├── App.tsx
└── main.tsx
```

## Key Pages

| Route | Page | Role |
|-------|------|------|
| `/dashboard` | Dashboard | Caregiver overview |
| `/patient/:id` | PatientDetail | Patient details + vitals |
| `/device/:id` | DeviceInfo | Device info + vitals |
| `/device-alerts` | DeviceAlerts | Alert management |
| `/alert-history` | AlertHistory | Past alerts |
| `/logs` | AllLogs | Device log feed |
| `/hospital/patients` | HospitalPatients | Hospital patient list |
| `/hospital/caregivers` | HospitalCaregivers | Hospital staff list |
| `/admin/hospitals` | AdminHospitals | Admin hospital management |
| `/admin/devices` | AdminDevices | Admin device management |
| `/account` | AccountPage | User profile / settings |

## Notes

- `PatientMap.tsx` is dead code (unused). Use `CaregiverMap.tsx` for map functionality.
- The mobile sidebar uses shadcn's `<Sheet>` component (managed by sidebar.tsx).
- API calls go through `VITE_API_URL` + `"/api"` prefix.
