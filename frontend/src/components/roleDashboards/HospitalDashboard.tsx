import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHospital } from "@/hooks/useHospital";
import { useHospitalDevices } from "@/hooks/useDevice";
import { useAlerts, useLatestVitals, useLatestLocations, useResolveAlert } from "@/hooks/useDeviceLogs";
import CaregiverMap from "@/components/CaregiverMap";
import type { DeviceLog } from "@/hooks/useDeviceLogs";
import { authClient } from "@/lib/auth-client";
import {
  Users,
  Smartphone,
  Activity,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  Bell,
  Clock,
  Heart,
  Droplets,
  Thermometer,
  Battery,
  Wifi,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Plus,
} from "lucide-react";

const eventTypeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  FALL: { label: "Fall", icon: AlertOctagon, color: "text-red-500 bg-red-500/10" },
  COLLISION: { label: "Collision", icon: AlertTriangle, color: "text-orange-500 bg-orange-500/10" },
  SOS: { label: "SOS", icon: Bell, color: "text-rose-500 bg-rose-500/10" },
  THRESHOLD: { label: "Threshold", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
  VITALS: { label: "Vitals", icon: Heart, color: "text-blue-500 bg-blue-500/10" },
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const hospitalId = session?.user?.hospitalId ?? "";
  const userName = session?.user?.name ?? session?.user?.email ?? "Unknown";

  const { data: hRes, isLoading: hLoading, error: hError } = useHospital(hospitalId);
  const { data: dRes, isLoading: dLoading, error: dError } = useHospitalDevices(hospitalId);
  const { data: aRes, isLoading: aLoading } = useAlerts(hospitalId, 1);
  const { mutate: resolveAlert } = useResolveAlert();

  const hospital = hRes?.data;
  const devices = dRes?.data ?? [];
  const alerts = (aRes?.data ?? []).slice(0, 5);

  const deviceIds = useMemo(() => devices.map(d => d._id), [devices]);
  const { data: vitalsRes } = useLatestVitals(deviceIds);
  const { data: locsRes } = useLatestLocations(deviceIds);

  const vitalsByDevice = useMemo(() => {
    const map = new Map<string, DeviceLog>();
    (vitalsRes?.data ?? []).forEach((v) => {
      if (v.deviceId) map.set(v.deviceId._id, v);
    });
    return map;
  }, [vitalsRes]);

  const alertsByDevice = useMemo(() => {
    const map = new Map<string, DeviceLog[]>();
    (aRes?.data ?? []).filter(a => !a.resolved).forEach((a) => {
      if (a.deviceId) {
        const arr = map.get(a.deviceId._id) ?? [];
        arr.push(a);
        map.set(a.deviceId._id, arr);
      }
    });
    return map;
  }, [aRes]);

  const locations = useMemo(() => locsRes ?? new Map(), [locsRes]);

  const patientsWithDevice = useMemo(() => {
    return (hospital?.patients ?? []).map((p: any) => {
      if (typeof p.device === "object" && p.device) return p;
      const match = devices.find((d) => {
        const pid = typeof d.patient === "object" ? d.patient?._id : d.patient;
        return String(pid) === String(p._id);
      });
      return match ? { ...p, device: { _id: match._id } } : p;
    });
  }, [hospital, devices]);

  const isLoading = hLoading || dLoading || aLoading;
  const error = hError || dError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-[hsl(var(--critical))] font-semibold">
            Failed to load dashboard data
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure the backend is running
          </p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-muted-foreground font-medium">
            No hospital assigned to your account
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            Contact an admin to be assigned to a hospital.
          </p>
        </div>
      </div>
    );
  }

  const patientList = (hospital.patients ?? []) as any[];
  const recentPatients = patientList
    .sort((a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  const activeDevices = devices.filter((d) => d.status === "active").length;
  const inactiveDevices = devices.filter((d) => d.status === "inactive").length;
  const unassignedDevices = devices.filter((d) => !d.patient).length;
  const caregiverCount = (hospital.careGivers ?? []).length;
  const patientCount = patientList.length;
  const deviceCount = (hospital.devices ?? []).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {hospital.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {hospital.location} &middot; {hospital.hospitalCode}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={patientCount} />
        <StatCard icon={Smartphone} label="Total Devices" value={deviceCount} />
        <StatCard icon={Activity} label="Devices Active" value={activeDevices} />
        <StatCard icon={Stethoscope} label="Care Providers" value={caregiverCount} />
      </div>

      <CaregiverMap
        patients={patientsWithDevice}
        locations={locations}
        vitalsByDevice={vitalsByDevice}
        alertsByDevice={alertsByDevice}
        onResolveAlert={(logId) => resolveAlert({ logId, resolvedBy: userName })}
        userName={userName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Patients
            </h2>
            <button
              onClick={() => navigate("/patients")}
              className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {recentPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["Name", "Code", "Diagnosis", "Date of Birth", ""].map(
                      (col) => (
                        <th
                          key={col}
                          className="py-2.5 px-4 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide first:pl-6 last:pr-6"
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p: any) => (
                    <tr
                      key={p._id}
                      onClick={() => navigate(`/patients/${p._id}`)}
                      className="border-b border-border hover:bg-muted/30 transition-colors group last:border-0 cursor-pointer"
                    >
                      <td className="py-3 pl-6 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Users className="h-3.5 w-3.5 text-accent" />
                          </div>
                          <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                            {p.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {p.patientCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {p.diagnosis ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="py-3 pl-4 pr-6">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium text-sm">
                No patients yet
              </p>
              <button
                onClick={() => navigate("/patients/add")}
                className="mt-3 text-xs text-accent hover:text-accent/80 font-medium"
              >
                Add your first patient
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Device Status
            </h2>
            {deviceCount === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Smartphone className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No devices yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span className="text-sm text-foreground">Active</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {activeDevices}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <span className="text-sm text-foreground">Inactive</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {inactiveDevices}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${deviceCount > 0 ? (activeDevices / deviceCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {deviceCount > 0
                    ? `${Math.round((activeDevices / deviceCount) * 100)}% of devices active`
                    : "No devices to report"}
                </p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Summary
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Patients</span>
                </div>
                <span className="font-semibold text-foreground">
                  {patientCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Care Providers</span>
                </div>
                <span className="font-semibold text-foreground">
                  {caregiverCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Unassigned Devices</span>
                </div>
                <span className="font-semibold text-foreground">
                  {unassignedDevices}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Avg devices / patient</span>
                </div>
                <span className="font-semibold text-foreground">
                  {patientCount > 0
                    ? (deviceCount / patientCount).toFixed(1)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            Recent Alerts
          </h2>
          <button
            onClick={() => navigate(`/hospitals/${hospitalId}/alerts`)}
            className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {alerts.length > 0 ? (
          <div className="divide-y divide-border">
            {alerts.map((a) => {
              const cfg = eventTypeConfig[a.data?.eventType ?? "VITALS"] ?? eventTypeConfig.VITALS;
              const Icon = cfg.icon;
              return (
                <div
                  key={a._id}
                  className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                    {a.deviceId?.serialNumber ?? a.deviceId?.deviceCode ?? "—"}
                  </span>
                  <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground flex-wrap">
                    {a.data?.hr != null && (
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3 text-red-400" /> {a.data.hr}
                      </span>
                    )}
                    {a.data?.spo2 != null && (
                      <span className="flex items-center gap-0.5">
                        <Droplets className="h-3 w-3 text-blue-400" /> {a.data.spo2}%
                      </span>
                    )}
                    {a.data?.temp != null && (
                      <span className="flex items-center gap-0.5">
                        <Thermometer className="h-3 w-3 text-amber-400" /> {a.data.temp}°C
                      </span>
                    )}
                    {a.data?.bat != null && (
                      <span className="hidden sm:inline-flex items-center gap-0.5">
                        <Battery className="h-3 w-3 text-green-400" /> {a.data.bat}%
                      </span>
                    )}
                    {a.data?.sig != null && (
                      <span className="hidden sm:inline-flex items-center gap-0.5">
                        <Wifi className="h-3 w-3" /> {a.data.sig}/4
                      </span>
                    )}
                    {a.data?.sos && (
                      <span className="text-[10px] font-bold uppercase text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        SOS
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No recent alerts</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/patients/add")}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Patient
        </button>
        <button
          onClick={() => navigate("/patients")}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border flex items-center gap-1.5"
        >
          <Users className="h-3.5 w-3.5" />
          View Patients
        </button>
        <button
          onClick={() => navigate(`/hospitals/${hospitalId}/caregivers`)}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border flex items-center gap-1.5"
        >
          <Stethoscope className="h-3.5 w-3.5" />
          Care Providers
        </button>
        <button
          onClick={() => navigate(`/hospitals/${hospitalId}/devices`)}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border flex items-center gap-1.5"
        >
          <Smartphone className="h-3.5 w-3.5" />
          View Devices
        </button>
        <button
          onClick={() => navigate(`/hospitals/${hospitalId}/alerts`)}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border flex items-center gap-1.5"
        >
          <Bell className="h-3.5 w-3.5" />
          Alerts
        </button>
      </div>
    </div>
  );
}
