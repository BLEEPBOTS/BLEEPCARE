import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useLatestVitals, useUnresolvedAlerts, useLatestLocations, useResolveAlert } from "@/hooks/useDeviceLogs";
import CaregiverMap from "@/components/CaregiverMap";
import type { Patient } from "@/hooks/usePatient";
import type { DeviceLog } from "@/hooks/useDeviceLogs";
import {
  Users,
  Bell,
  Heart,
  Droplets,
  Thermometer,
  Battery,
  Wifi,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Check,
  Clock,
  Activity,
  Smartphone,
} from "lucide-react";

const eventTypeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  FALL: { label: "Fall", icon: AlertOctagon, color: "text-red-500 bg-red-500/10" },
  COLLISION: { label: "Collision", icon: AlertTriangle, color: "text-orange-500 bg-orange-500/10" },
  SOS: { label: "SOS", icon: Bell, color: "text-rose-500 bg-rose-500/10" },
  THRESHOLD: { label: "Threshold", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
  VITALS: { label: "Vitals", icon: Heart, color: "text-blue-500 bg-blue-500/10" },
};

type VitalStatus = "normal" | "warning" | "critical";

function vitalsStatus(hr?: number, spo2?: number, temp?: number): { status: VitalStatus; label: string } {
  let worst: VitalStatus = "normal";
  if (hr != null && (hr < 40 || hr > 120)) worst = "critical";
  else if (hr != null && (hr < 60 || hr > 100)) worst = "warning";
  if (spo2 != null && spo2 < 90) worst = "critical";
  else if (spo2 != null && spo2 < 95 && worst !== "critical") worst = "warning";
  if (temp != null && (temp < 35 || temp > 39)) worst = "critical";
  else if (temp != null && (temp < 36 || temp > 37.5) && worst !== "critical") worst = "warning";
  const label = worst === "critical" ? "Critical" : worst === "warning" ? "Warning" : "Normal";
  return { status: worst, label };
}

const statusColors: Record<VitalStatus, string> = {
  normal: "bg-emerald-500/10 text-emerald-500",
  warning: "bg-amber-500/10 text-amber-500",
  critical: "bg-red-500/10 text-red-500",
};

export default function CaregiverDashboard() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? session?.user?.email ?? "Unknown";

  const { data: patientsRes, isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: ["caregiver-patients", userId],
    queryFn: () => api.post<{ data: Patient[] }>("/patient/query", { careGiverId: userId }),
    enabled: !!userId,
  });

  const patients = patientsRes?.data ?? [];

  const deviceIds = useMemo(
    () =>
      patients
        .map((p) => (typeof p.device === "object" && p.device?._id ? p.device._id : null))
        .filter((id): id is string => !!id),
    [patients],
  );

  const { data: vitalsRes, isLoading: vitalsLoading } = useLatestVitals(deviceIds);
  const { data: alertsRes, isLoading: alertsLoading } = useUnresolvedAlerts(deviceIds);
  const { data: locsRes, isLoading: locsLoading } = useLatestLocations(deviceIds);
  const { mutate: resolveAlert } = useResolveAlert();

  const vitalsByDevice = useMemo(() => {
    const map = new Map<string, DeviceLog>();
    (vitalsRes?.data ?? []).forEach((v) => {
      if (v.deviceId) map.set(v.deviceId._id, v);
    });
    return map;
  }, [vitalsRes]);

  const alertsByDevice = useMemo(() => {
    const map = new Map<string, DeviceLog[]>();
    (alertsRes?.data ?? []).forEach((a) => {
      if (a.deviceId) {
        const arr = map.get(a.deviceId._id) ?? [];
        arr.push(a);
        map.set(a.deviceId._id, arr);
      }
    });
    return map;
  }, [alertsRes]);

  const locations = useMemo(() => locsRes ?? new Map(), [locsRes]);

  const isLoading = patientsLoading || vitalsLoading || alertsLoading || locsLoading;
  const error = patientsError;

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
            Failed to load patient data
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure the backend is running
          </p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No patients assigned
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm mx-auto">
            You don&apos;t have any patients yet. Contact a hospital admin to
            assign patients to you.
          </p>
        </div>
      </div>
    );
  }

  const totalAlerts = (alertsRes?.data ?? []).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          My Patients
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {patients.length} patient{patients.length !== 1 ? "s" : ""}
          {totalAlerts > 0 ? ` · ${totalAlerts} unresolved alert${totalAlerts !== 1 ? "s" : ""}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Assigned Patients", value: patients.length },
          { icon: Bell, label: "Unresolved Alerts", value: totalAlerts },
          {
            icon: Heart,
            label: "Avg Heart Rate",
            value: (() => {
              const vals = Array.from(vitalsByDevice.values()).map((v) => v.data?.hr).filter((h): h is number => h != null);
              return vals.length > 0 ? `${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}` : "—";
            })(),
          },
          {
            icon: Droplets,
            label: "Avg SpO₂",
            value: (() => {
              const vals = Array.from(vitalsByDevice.values()).map((v) => v.data?.spo2).filter((s): s is number => s != null);
              return vals.length > 0 ? `${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}%` : "—";
            })(),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <s.icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <CaregiverMap
        patients={patients}
        locations={locations}
        vitalsByDevice={vitalsByDevice}
        alertsByDevice={alertsByDevice}
        onResolveAlert={(logId) => resolveAlert({ logId, resolvedBy: userName })}
        userName={userName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {patients.map((p) => {
          const deviceId = typeof p.device === "object" ? p.device?._id : null;
          const vitals = deviceId ? vitalsByDevice.get(deviceId) : undefined;
          const d = vitals?.data;
          const deviceAlerts = deviceId ? alertsByDevice.get(deviceId) ?? [] : [];
          const { status, label } = vitalsStatus(d?.hr, d?.spo2, d?.temp);

          return (
            <div
              key={p._id}
              onClick={() => navigate(`/patients/${p._id}`)}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {p.patientCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[status]}`}
                  >
                    {label}
                  </span>
                  {d?.sos && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 uppercase">
                      SOS
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  {p.diagnosis}
                </p>

                {d ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                    {[
                      { icon: Heart, value: d.hr, unit: "bpm", color: d.hr != null && (d.hr < 60 || d.hr > 100) ? "text-red-400" : "text-emerald-400" },
                      { icon: Droplets, value: d.spo2 != null ? `${d.spo2}%` : null, color: d.spo2 != null && d.spo2 < 95 ? "text-red-400" : "text-blue-400" },
                      { icon: Thermometer, value: d.temp != null ? `${d.temp}°` : null, color: d.temp != null && (d.temp < 36 || d.temp > 37.5) ? "text-red-400" : "text-amber-400" },
                      { icon: Battery, value: d.bat != null ? `${d.bat}%` : null, color: d.bat != null && d.bat < 20 ? "text-red-400" : "text-green-400" },
                      { icon: Wifi, value: d.sig != null ? `${d.sig}/4` : null, color: d.sig != null && d.sig < 2 ? "text-red-400" : "text-green-400" },
                    ].map((m) => (
                      <div key={m.unit ?? m.value} className="flex flex-col items-center gap-1">
                        <m.icon className={`h-4 w-4 ${m.color}`} />
                        <span className="text-xs font-semibold text-foreground">
                          {m.value ?? "—"}
                        </span>
                        {(m as any).unit && (
                          <span className="text-[9px] text-muted-foreground">
                            {(m as any).unit}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No vitals data yet
                  </p>
                )}

                {deviceAlerts.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Alerts ({deviceAlerts.length})
                    </p>
                    {deviceAlerts.map((a) => {
                      const cfg = eventTypeConfig[a.data?.eventType ?? "VITALS"] ?? eventTypeConfig.VITALS;
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={a._id}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50"
                        >
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${cfg.color}`}
                          >
                            <Icon className="h-2.5 w-2.5" />
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(a.createdAt).toLocaleString()}
                          </span>
                          <button
                            onClick={() =>
                              resolveAlert({ logId: a._id, resolvedBy: userName })
                            }
                            className="ml-auto px-3 py-2 text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors rounded-lg"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Resolve
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
