import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAlerts } from "@/hooks/useDeviceLogs";
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  Heart,
  Droplets,
  Thermometer,
  Battery,
  Wifi,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

const eventTypeConfig: Record<
  string,
  { label: string; icon: typeof AlertTriangle; color: string }
> = {
  FALL: { label: "Fall", icon: AlertOctagon, color: "text-red-500 bg-red-500/10" },
  COLLISION: { label: "Collision", icon: AlertTriangle, color: "text-orange-500 bg-orange-500/10" },
  SOS: { label: "SOS", icon: Bell, color: "text-rose-500 bg-rose-500/10" },
  THRESHOLD: { label: "Threshold", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
  VITALS: { label: "Vitals", icon: Heart, color: "text-blue-500 bg-blue-500/10" },
};

export default function AlertHistory() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const [page, setPage] = useState(1);
  const { data: res, isLoading, error } = useAlerts(hospitalId ?? "", page);
  const alerts = res?.data ?? [];
  const total = res?.total ?? 0;
  const limit = res?.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!hospitalId) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-muted-foreground font-medium">
            No hospital selected
          </p>
        </div>
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
          <p className="text-[hsl(var(--critical))] font-semibold">
            Failed to load alerts
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure the backend is running
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} alert{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Time", "Event", "Device", "Heart Rate", "SpO₂", "Temp", "Battery", "Signal", "SOS"].map(
                  (col) => (
                    <th
                      key={col}
                      className="py-3 px-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide first:pl-6 last:pr-6"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const cfg = eventTypeConfig[a.data?.eventType ?? "VITALS"] ?? eventTypeConfig.VITALS;
                const Icon = cfg.icon;
                return (
                  <tr
                    key={a._id}
                    className="border-b border-border hover:bg-muted/30 transition-colors group last:border-0"
                  >
                    <td className="py-3 pl-6 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}
                      >
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
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Heart className="h-3 w-3 text-red-400" />
                        {a.data?.hr ?? "—"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Droplets className="h-3 w-3 text-blue-400" />
                        {a.data?.spo2 != null ? `${a.data.spo2}%` : "—"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Thermometer className="h-3 w-3 text-amber-400" />
                        {a.data?.temp != null ? `${a.data.temp}°C` : "—"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Battery className={`h-3 w-3 ${(a.data?.bat ?? 0) < 20 ? "text-red-400" : "text-green-400"}`} />
                        {a.data?.bat != null ? `${a.data.bat}%` : "—"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Wifi className={`h-3 w-3 ${(a.data?.sig ?? 0) < 2 ? "text-red-400" : "text-green-400"}`} />
                        {a.data?.sig != null ? `${a.data.sig}/4` : "—"}
                      </div>
                    </td>
                    <td className="py-3 pl-3 pr-6">
                      {a.data?.sos ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 uppercase tracking-wide">
                          <Bell className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
            <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No alerts
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Alert events from devices at this hospital will appear here.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
