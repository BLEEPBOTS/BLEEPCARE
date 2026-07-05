# AI-Driven Development Guide

## Project Conventions

- **Frontend:** React 18 + Vite + shadcn/ui + Tailwind CSS v3 + TanStack Query v5 + react-router-dom v6
- **Backend:** Express v5 + Mongoose v9 + better-auth + MQTT.js v5
- **Auth:** better-auth (cookie-based, handles JWT via `BETTER_AUTH_SECRET`)
- **Styling:** Tailwind utility classes only. No CSS modules or styled-components. Use shadcn components from `src/components/ui/`.
- **API client:** `src/lib/api.ts` wraps `fetch` — all requests go through `VITE_API_URL + "/api"`.
- **Env vars:** Backend uses `dotenv` (`.env`). Frontend Vite vars use `VITE_` prefix.

## Common Patterns

### Adding a new page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx` inside `<Routes>`
3. If sidebar nav needed, add entry in `SideBarOptions.tsx`

### Adding a new API route
1. Create route file in `backend/routes/`
2. Create controller (if complex) in `backend/controllers/`
3. Register in `backend/index.js` with `app.use("/api/...", router)`

### Using shadcn components
```bash
cd frontend
npx shadcn@latest add button card dialog sheet
```

## Common Pitfalls

- `process.env.ENVIRONMENT === "dev"` controls permissive CORS — set it in dev.
- Express default port is 3500; bridge default is 8080; frontend dev is 5173.
- better-auth reads `BETTER_AUTH_SECRET` env var implicitly.
- `ENABLE_MQTT` must be `"true"` (string) to enable MQTT ingestion in backend.
- Do NOT edit `src/components/ui/sidebar.tsx` wrapper directly — it's a shadcn managed file.
- `PatientMap.tsx` is unused (dead code) — CaregiverMap is the live map component.
