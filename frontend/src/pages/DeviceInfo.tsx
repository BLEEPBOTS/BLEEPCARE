import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useLatestLogsForDevices } from "@/hooks/useDeviceLogs";
import type { Patient } from "@/hooks/usePatient";
import {
  Smartphone,
  Heart,
  Droplets,
  Thermometer,
  Battery,
  Wifi,
  Activity,
  Clock,
  AlertOctagon,
  Bell,
  Users,
  Loader2,
} from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500",
  inactive: "bg-muted text-muted-foreground",
};

export default function DeviceInfo() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data: patientsRes, isLoading: patientsLoading } = useQuery({
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

  const deviceInfo = useMemo(() => {
    const map = new Map<string, { serialNumber?: string; deviceCode?: string; status?: string; hospital?: string }>();
    patients.forEach((p) => {
      if (typeof p.device === "object" && p.device) {
        const d = p.device as any;
        if (d._id && !map.has(d._id)) {
          map.set(d._id, { serialNumber: d.serialNumber, deviceCode: d.deviceCode, status: d.status });
        }
      }
    });
    return map;
  }, [patients]);

  const { data: logsRes, isLoading: logsLoading } = useLatestLogsForDevices(deviceIds);

  const logsByDevice = useMemo(() => {
    const map = new Map<string, any>();
    (logsRes?.data ?? []).forEach((log: any) => {
      if (log.deviceId) map.set(log.deviceId, log);
    });
    return map;
  }, [logsRes]);

  const isLoading = patientsLoading || logsLoading;

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <p className="text-muted-foreground font-medium">Not authenticated</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (deviceIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <Smartphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No devices found</p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm mx-auto">
            You don&apos;t have any patients with assigned devices yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Device Info</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {deviceIds.length} device{deviceIds.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deviceIds.map((did) => {
          const info = deviceInfo.get(did);
          const log = logsByDevice.get(did);
          const d = log?.data;

          return (
            <div key={did} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {info?.serialNumber ?? "—"}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {info?.deviceCode}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[info?.status ?? ""] ?? statusColors.inactive}`}>
                  {info?.status ?? "inactive"}
                </span>
              </div>

              <div className="px-6 py-4 space-y-4">
                {log ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last update: {new Date(log.createdAt).toLocaleString()}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${log.event === "alert" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
                        {log.event}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 pt-2">
                      {[
                        { icon: Heart, value: d?.hr, unit: "bpm", color: d?.hr != null && (d.hr < 60 || d.hr > 100) ? "text-red-400" : "text-emerald-400" },
                        { icon: Droplets, value: d?.spo2 != null ? `${d.spo2}%` : null, color: d?.spo2 != null && d.spo2 < 95 ? "text-red-400" : "text-blue-400" },
                        { icon: Thermometer, value: d?.temp != null ? `${d.temp}°` : null, color: d?.temp != null && (d.temp < 36 || d.temp > 37.5) ? "text-red-400" : "text-amber-400" },
                        { icon: Battery, value: d?.bat != null ? `${d.bat}%` : null, color: d?.bat != null && d.bat < 20 ? "text-red-400" : "text-green-400" },
                        { icon: Wifi, value: d?.sig != null ? `${d.sig}/4` : null, color: d?.sig != null && d.sig < 2 ? "text-red-400" : "text-green-400" },
                      ].map((m, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <m.icon className={`h-4 w-4 ${m.color}`} />
                          <span className="text-xs font-semibold text-foreground">{m.value ?? "—"}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {d?.sos && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 uppercase flex items-center gap-1">
                          <Bell className="h-2.5 w-2.5" /> SOS
                        </span>
                      )}
                      {d?.fallScore != null && d.fallScore >= 60 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 uppercase flex items-center gap-1">
                          <AlertOctagon className="h-2.5 w-2.5" /> Fall
                        </span>
                      )}
                      {d?.collScore != null && d.collScore >= 60 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 uppercase flex items-center gap-1">
                          Collision
                        </span>
                      )}
                      {d?.motion && d.motion !== "IDLE" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {d.motion}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">No data received yet</p>
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
