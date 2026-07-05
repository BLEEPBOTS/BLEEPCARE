import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { useDeviceAlerts, useResolveAlert } from "@/hooks/useDeviceLogs";
import type { Patient } from "@/hooks/usePatient";
import {
  AlertTriangle,
  Bell,
  Heart,
  Droplets,
  Thermometer,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  AlertCircle,
  Loader2,
} from "lucide-react";

const eventTypeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  FALL: { label: "Fall", icon: AlertOctagon, color: "text-red-500 bg-red-500/10" },
  COLLISION: { label: "Collision", icon: AlertTriangle, color: "text-orange-500 bg-orange-500/10" },
  SOS: { label: "SOS", icon: Bell, color: "text-rose-500 bg-rose-500/10" },
  THRESHOLD: { label: "Threshold", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
  VITALS: { label: "Vitals", icon: Heart, color: "text-blue-500 bg-blue-500/10" },
};

export default function DeviceAlerts() {
  const [page, setPage] = useState(1);
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? session?.user?.email ?? "Unknown";

  const { data: patientsRes } = useQuery({
    queryKey: ["caregiver-patients", userId],
    queryFn: () => api.post<{ data: Patient[] }>("/patient/query", { careGiverId: userId }),
    enabled: !!userId,
  });

  const deviceIds = useMemo(
    () =>
      (patientsRes?.data ?? [])
        .map((p) => (typeof p.device === "object" && p.device?._id ? p.device._id : null))
        .filter((id): id is string => !!id),
    [patientsRes],
  );

  const { data: res, isLoading, error } = useDeviceAlerts(deviceIds, page);
  const { mutate: resolveAlert } = useResolveAlert();

  const alerts = res?.data ?? [];
  const total = res?.total ?? 0;
  const limit = res?.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-[hsl(var(--critical))] font-semibold">Failed to load alerts</p>
          <p className="text-sm text-muted-foreground mt-2">Make sure the backend is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {total} alert{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Time", "Event", "Device", "HR", "SpO₂", "Temp", "Resolved", ""].map((col) => (
                  <th key={col} className="py-3 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide first:pl-6 last:pr-6">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const cfg = eventTypeConfig[a.data?.eventType ?? "VITALS"] ?? eventTypeConfig.VITALS;
                const Icon = cfg.icon;
                return (
                  <tr key={a._id} className="border-b border-border hover:bg-muted/30 transition-colors group last:border-0">
                    <td className="py-3 pl-6 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        {a.deviceId?.serialNumber ?? a.deviceId?.deviceCode ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-foreground">{a.data?.hr ?? "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-foreground">{a.data?.spo2 != null ? `${a.data.spo2}%` : "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-foreground">{a.data?.temp != null ? `${a.data.temp}°C` : "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      {a.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Check className="h-2.5 w-2.5" />
                          Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="py-3 pl-3 pr-6">
                      {!a.resolved && (
                        <button
                          onClick={() => resolveAlert({ logId: a._id, resolvedBy: userName })}
                          className="px-3 py-2 text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors rounded-lg"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No alerts</p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Alert events from your patients&apos; devices will appear here.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
