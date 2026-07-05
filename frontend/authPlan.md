# BleepCare Frontend Auth Integration Plan

## Overview

Integrate the React frontend (care-connect-dashboard) with the Flask backend (backend) for authentication and user profile. Replace mock auth with real API calls using TanStack Query.

## Backend API (Phase 1 - Complete)

Base URL: `http://localhost:3000` (dev) → configurable via env

| Endpoint | Method | Auth | Request | Response |
|----------|-------|------|--------|---------|
| `/auth/register` | POST | - | `{ email, password }` | `{ message: "Registration successful" }` |
| `/auth/login` | POST | - | `{ email, password }` | `{ access_token, refresh_token, account_id }` |
| `/auth/logout` | POST | Access | - | `{ message: "Logout successful" }` |
| `/auth/refresh` | POST | Refresh | - | `{ access_token }` |
| `/account/me` | GET | Access | - | `{ id, name, dob, gender, district, home_address, phone, role }` |
| `/account/me` | PUT | Access | `{ name?, dob?, gender?, ... }` | Account response |

### Token Strategy

- **Storage**: httpOnly cookies (browser automatically sends)
- **Access token**: 15 min expiry
- **Refresh token**: 7 days expiry (sent as cookie)
- **Fallback**: Authorization header if cookie not available

## Frontend Architecture

### Current State

- React + Vite + TypeScript
- TanStack Query (`@tanstack/react-query@5.83.0`) already installed
- Mock auth in `AuthContext.tsx` with hardcoded credentials
- Mock user data in `mockData.ts`

### New Structure

```
src/
├── lib/
│   └── api.ts          # API client with credentials
├── hooks/
│   ├── useAuth.ts      # Login/register/logout mutations
│   └── useAccount.ts   # Account profile query
├── pages/
│   ├── Login.tsx      # Updated to use useAuth()
│   └── SignUp.tsx     # NEW - Register page
└── context/
    └── AuthContext.tsx  # Simplified - only UI state (lock screen)
```

### Dependencies

All already in `package.json`:
- `@tanstack/react-query`
- `react-router-dom`
- `react-hook-form`
- `zod`

## File Changes

### 1. Vite Config - Proxy with Env

**File**: `vite.config.ts`

```ts
server: {
  proxy: {
    "/api": {
      target: process.env.VITE_API_URL || "http://localhost:3000",
      changeOrigin: true,
    },
  },
}
```

### 2. Environment Variables

**File**: `.env`

```
VITE_API_URL=http://localhost:3000
```

### 3. API Client

**File**: `src/lib/api.ts`

```ts
const API_URL = import.meta.env.VITE_API_URL || "/api";

interface ApiError {
  message: string;
  code?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("/api") ? endpoint : `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
```

### 4. Auth Hooks

**File**: `src/hooks/useAuth.ts`

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  account_id: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      api.post<LoginResponse>("/auth/login", creds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<{ message: string }>("/auth/register", data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<{ message: string }>("/auth/logout", {}),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
```

### 5. Account Hook

**File**: `src/hooks/useAccount.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Account {
  id: string;
  name: string | null;
  dob: string | null;
  gender: string | null;
  district: string | null;
  home_address: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: () => api.get<Account>("/account/me"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### 6. Login Page

**File**: `src/pages/Login.tsx`

Changes:
- Import `useAuth` hook
- Replace `login()` from context with `loginMutation.mutateAsync()`
- Handle `isPending`, `isError`, `error`

### 7. Sign Up Page

**File**: `src/pages/SignUp.tsx` (NEW)

Create based on Login.tsx styling:
- Email, Password, Confirm Password fields
- POST to `/auth/register`
- On success → redirect to `/login`

### 8. Simplified AuthContext

**File**: `src/context/AuthContext.tsx`

Keep only for:
- `isAuthenticated` state (check for valid cookie/token)
- `isLocked` state (lock screen)
- Auto-lock on inactivity (existing logic)

Remove:
- Hardcoded credentials
- `login()`, `logout()` logic → moved to TanStack Query

### 9. Dashboard

**File**: `src/pages/Dashboard.tsx`

Changes:
- Import `useAccount()` hook
- Replace `currentUser` mock with actual user data
- Update greeting: "Welcome back, {name}" or "Welcome back"

### 10. App Routes

**File**: `src/App.tsx`

Add:
- `<Route path="/signup" element={<SignUp />} />`

## Implementation Order

1. `vite.config.ts` + `.env`
2. `src/lib/api.ts`
3. `src/hooks/useAuth.ts` + `src/hooks/useAccount.ts`
4. `src/pages/Login.tsx`
5. `src/pages/SignUp.tsx` (new)
6. `src/context/AuthContext.tsx`
7. `src/pages/Dashboard.tsx`
8. `src/App.tsx`

## Testing Checklist

- [ ] Register new user → check MongoDB
- [ ] Login with new user → redirects to dashboard
- [ ] Wrong credentials → shows error message
- [ ] Logout → clears session, redirects to login
- [ ] Dashboard shows user name from `/account/me`
- [ ] Auto-refresh token works (after 15 min)
- [ ] Cross-browsercookie works

## Production Notes

In production:
1. Set `VITE_API_URL=https://api.bleepcare.com`
2. Ensure CORS allows frontend origin
3. Use HTTPS for both
4. Consider JWT token in localStorage as fallback for non-cookie clients