import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminLayout } from "@/components/AdminLayout";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
// import Lockout from "@/pages/Lockout";
import AccountLockout from "@/pages/AccountLockout";
import Dashboard from "@/pages/Dashboard";
import PatientDetail from "@/pages/PatientDetail";
import AlertHistory from "@/pages/AlertHistory";
import HealthTrends from "@/pages/HealthTrends";
import EmergencyResponse from "@/pages/EmergencyResponse";
import Users from "@/pages/Users";
import AccountPage from "@/pages/AccountPage";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import AdminHospitals from "./pages/AdminHospitals";
import AdminCreateHospital from "./pages/AdminCreateHospital";
import AdminDevices from "./pages/AdminDevices";
import AdminCreateDevice from "./pages/AdminCreateDevice";
import HospitalCaregivers from "./pages/HospitalCaregivers";
import HospitalAddCaregiver from "./pages/HospitalAddCaregiver";
import HospitalPatients from "./pages/HospitalPatients";
import HospitalAddPatient from "./pages/HospitalAddPatient";
import HospitalDevices from "./pages/HospitalDevices";
import DeviceAlerts from "./pages/DeviceAlerts";
import DeviceInfo from "./pages/DeviceInfo";
import AllLogs from "./pages/AllLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <RequireAuth>
          <AppRoutes />
        </RequireAuth>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/lockout" element={<AccountLockout />} />
      <Route path="/emergency/:id" element={<EmergencyResponse />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hospitals" element={<AdminHospitals />} />
        <Route path="/hospitals/create" element={<AdminCreateHospital />} />
        <Route path="/devices" element={<AdminDevices />} />
        <Route path="/devices/create" element={<AdminCreateDevice />} />
        <Route path="/hospitals/:hospitalId/caregivers" element={<HospitalCaregivers />} />
        <Route path="/hospitals/:hospitalId/caregivers/add" element={<HospitalAddCaregiver />} />
        <Route path="/hospitals/:hospitalId/devices" element={<HospitalDevices />} />
        <Route path="/hospitals/:hospitalId/alerts" element={<AlertHistory />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/patients" element={<HospitalPatients />} />
        <Route path="/patients/add" element={<HospitalAddPatient />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/device-logs" element={<DeviceAlerts />} />
        <Route path="/device-info" element={<DeviceInfo />} />
        <Route path="/logs" element={<AllLogs />} />
        <Route path="/alerts" element={<AlertHistory />} />
        <Route path="/trends" element={<HealthTrends />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
