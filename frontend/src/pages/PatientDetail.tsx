import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatient } from "@/hooks/usePatient";
import { useLatestVitals, useUnresolvedAlerts, useFilteredLogs, useResolveAlert } from "@/hooks/useDeviceLogs";
import { authClient } from "@/lib/auth-client";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  ArrowLeft,
  Users,
  Smartphone,
  Heart,
  Droplets,
  Thermometer,
  Battery,
  Wifi,
  Bell,
  Clock,
  Check,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Activity,
  Loader2,
  User,
  Calendar,
  Stethoscope,
  Hash,
  TrendingUp,
} from "lucide-react";

const eventTypeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  FALL: { label: "Fall", icon: AlertOctagon, color: "text-red-500 bg-red-500/10" },
  COLLISION: { label: "Collision", icon: AlertTriangle, color: "text-orange-500 bg-orange-500/10" },
  SOS: { label: "SOS", icon: Bell, color: "text-rose-500 bg-rose-500/10" },
  THRESHOLD: { label: "Threshold", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
  VITALS: { label: "Vitals", icon: Heart, color: "text-blue-500 bg-blue-500/10" },
};

type VitalStatus = "normal" | "warning" | "critical";

function vitalsStatus(hr?: number, spo2?: number, temp?: number): VitalStatus {
  let worst: VitalStatus = "normal";
  if (hr != null && (hr < 40 || hr > 120)) worst = "critical";
  else if (hr != null && (hr < 60 || hr > 100)) worst = "warning";
  if (spo2 != null && spo2 < 90) worst = "critical";
  else if (spo2 != null && spo2 < 95 && worst !== "critical") worst = "warning";
  if (temp != null && (temp < 35 || temp > 39)) worst = "critical";
  else if (temp != null && (temp < 36 || temp > 37.5) && worst !== "critical") worst = "warning";
  return worst;
}

const statusColors: Record<VitalStatus, string> = {
  normal: "bg-emerald-500/10 text-emerald-500",
  warning: "bg-amber-500/10 text-amber-500",
  critical: "bg-red-500/10 text-red-500",
};

const statusLabels: Record<VitalStatus, string> = {
  normal: "Normal",
  warning: "Warning",
  critical: "Critical",
};

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name ?? session?.user?.email ?? "Unknown";
  const { data: pRes, isLoading: pLoading, error: pError } = usePatient(id ?? "");

  const patient = pRes?.data;
  const deviceId = typeof patient?.device === "object" ? patient.device._id : null;

  const { data: vitalsRes } = useLatestVitals(deviceId ? [deviceId] : []);
  const { data: alertsRes } = useUnresolvedAlerts(deviceId ? [deviceId] : []);
  const { data: logsRes } = useFilteredLogs(deviceId ? [deviceId] : []);
  const { mutate: resolveAlert } = useResolveAlert();

  const latestVitals = (vitalsRes?.data ?? [])[0];
  const d = latestVitals?.data;
  const unresolvedAlerts = alertsRes?.data ?? [];
  const logs = logsRes?.data ?? [];
  const status = vitalsStatus(d?.hr, d?.spo2, d?.temp);

  const statCards = useMemo(() => [
    { icon: Heart, value: d?.hr != null ? `${d.hr}` : "—", unit: "bpm", label: "Heart Rate", color: d?.hr != null && (d.hr < 60 || d.hr > 100) ? "text-red-400" : "text-emerald-400" },
    { icon: Droplets, value: d?.spo2 != null ? `${d.spo2}%` : "—", unit: "SpO₂", label: "Oxygen Saturation", color: d?.spo2 != null && d.spo2 < 95 ? "text-red-400" : "text-blue-400" },
    { icon: Thermometer, value: d?.temp != null ? `${d.temp}°` : "—", unit: "°C", label: "Temperature", color: d?.temp != null && (d.temp < 36 || d.temp > 37.5) ? "text-red-400" : "text-amber-400" },
    { icon: Battery, value: d?.bat != null ? `${d.bat}%` : "—", unit: "Battery", label: "Battery Level", color: d?.bat != null && d.bat < 20 ? "text-red-400" : "text-green-400" },
    { icon: Wifi, value: d?.sig != null ? `${d.sig}/4` : "—", unit: "Signal", label: "Signal Strength", color: d?.sig != null && d.sig < 2 ? "text-red-400" : "text-green-400" },
  ], [d]);

  const chartData = useMemo(() => {
    const sorted = [...logs].reverse();
    return sorted.map((log, i) => ({
      label: `#${i + 1}`,
      time: new Date(log.createdAt).toLocaleTimeString(),
      hr: log.data?.hr ?? null,
      spo2: log.data?.spo2 ?? null,
      temp: log.data?.temp ?? null,
      bat: log.data?.bat ?? null,
      sig: log.data?.sig ?? null,
    }));
  }, [logs]);

  if (pLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (pError || !patient) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <p className="text-[hsl(var(--critical))] font-semibold">Failed to load patient</p>
          <p className="text-sm text-muted-foreground mt-2">Make sure the backend is running</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-accent hover:text-accent/80 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                  {statusLabels[status]}
                </span>
                {d?.sos && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 uppercase">
                    SOS
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {patient.patientCode}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Patient Information
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Diagnosis</span>
                    <span className="font-medium text-foreground text-right">{patient.diagnosis ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span className="font-medium text-foreground">
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Caregiver</span>
                    <span className="font-medium text-foreground text-right">
                      {typeof patient.careGiver === "object" ? patient.careGiver.name : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium text-foreground">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5" />
                  Device Information
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Serial Number</span>
                    <span className="font-medium text-foreground font-mono text-xs">
                      {patient.device?.serialNumber ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Device Code</span>
                    <span className="font-medium text-foreground font-mono text-xs">
                      {patient.device?.deviceCode ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${patient.device?.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {patient.device?.status ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                Current Vitals
              </h3>
              {d ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {statCards.map((s) => (
                    <div key={s.label} className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col items-center gap-2">
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 border border-border rounded-xl">
                  No vitals data yet
                </p>
              )}
            </div>

            {chartData.length > 2 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Vital Trends
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/30 border border-border rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-400" />
                      Heart Rate
                    </p>
                    <ChartContainer config={{ hr: { label: "HR", color: "#ef4444" } }} className="aspect-[2/1]">
                      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={false} axisLine={false} />
                        <YAxis domain={["dataMin - 10", "dataMax + 10"]} tick={{ fontSize: 10 }} width={28} axisLine={false} tickLine={false} />
                        <ChartTooltip
                          content={<ChartTooltipContent formatter={(v: number) => `${v} bpm`} labelFormatter={(l, p) => p?.[0]?.payload?.time ?? l} />}
                        />
                        <Line type="monotone" dataKey="hr" stroke="var(--color-hr)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-400" />
                      SpO₂
                    </p>
                    <ChartContainer config={{ spo2: { label: "SpO₂", color: "#3b82f6" } }} className="aspect-[2/1]">
                      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={false} axisLine={false} />
                        <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} width={28} axisLine={false} tickLine={false} />
                        <ChartTooltip
                          content={<ChartTooltipContent formatter={(v: number) => `${v}%`} labelFormatter={(l, p) => p?.[0]?.payload?.time ?? l} />}
                        />
                        <Line type="monotone" dataKey="spo2" stroke="var(--color-spo2)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-xl p-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-amber-400" />
                      Temperature
                    </p>
                    <ChartContainer config={{ temp: { label: "Temp", color: "#f97316" } }} className="aspect-[2/1]">
                      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={false} axisLine={false} />
                        <YAxis domain={[34, 40]} tick={{ fontSize: 10 }} width={28} axisLine={false} tickLine={false} />
                        <ChartTooltip
                          content={<ChartTooltipContent formatter={(v: number) => `${v}°C`} labelFormatter={(l, p) => p?.[0]?.payload?.time ?? l} />}
                        />
                        <Line type="monotone" dataKey="temp" stroke="var(--color-temp)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            )}

            {unresolvedAlerts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5" />
                  Recent Alerts ({unresolvedAlerts.length})
                </h3>
                <div className="space-y-2">
                  {unresolvedAlerts.map((a) => {
                    const cfg = eventTypeConfig[a.data?.eventType ?? "VITALS"] ?? eventTypeConfig.VITALS;
                    const Icon = cfg.icon;
                    return (
                      <div key={a._id} className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/30">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(a.createdAt).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground flex-wrap">
                          {a.data?.hr != null && (
                            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-red-400" /> {a.data.hr}</span>
                          )}
                          {a.data?.spo2 != null && (
                            <span className="flex items-center gap-0.5"><Droplets className="h-3 w-3 text-blue-400" /> {a.data.spo2}%</span>
                          )}
                          {a.data?.temp != null && (
                            <span className="flex items-center gap-0.5"><Thermometer className="h-3 w-3 text-amber-400" /> {a.data.temp}°C</span>
                          )}
                          {a.data?.bat != null && (
                            <span className="hidden sm:inline-flex items-center gap-0.5"><Battery className="h-3 w-3 text-green-400" /> {a.data.bat}%</span>
                          )}
                          {a.data?.sig != null && (
                            <span className="hidden sm:inline-flex items-center gap-0.5"><Wifi className="h-3 w-3" /> {a.data.sig}/4</span>
                          )}
                          {a.data?.sos && (
                            <span className="text-[10px] font-bold uppercase text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">SOS</span>
                          )}
                        </div>
                        <button
                          onClick={() => resolveAlert({ logId: a._id, resolvedBy: userName })}
                          className="px-3 py-2 text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors shrink-0 rounded-lg"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Resolve
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-muted/30 border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Latest Readings
              </h3>
              <div className="space-y-3">
                {logs.slice(0, 10).map((log) => {
                  const ld = log.data;
                  return (
                    <div key={log._id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground font-mono text-[10px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {ld?.hr != null && <span className="font-medium text-foreground">{ld.hr}bpm</span>}
                        {ld?.spo2 != null && <span className="font-medium text-foreground">{ld.spo2}%</span>}
                        {ld?.temp != null && <span className="font-medium text-foreground">{ld.temp}°</span>}
                      </div>
                    </div>
                  );
                })}
                {logs.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No readings yet</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Device Details
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Serial</span>
                  <span className="font-medium text-foreground font-mono text-xs">{patient.device?.serialNumber ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-medium text-foreground font-mono text-xs">{patient.device?.deviceCode ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${patient.device?.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                    {patient.device?.status ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Battery</span>
                  <span className="font-medium text-foreground">{d?.bat != null ? `${d.bat}%` : "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Signal</span>
                  <span className="font-medium text-foreground">{d?.sig != null ? `${d.sig}/4` : "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">GPS</span>
                  <span className="font-medium text-foreground">{d?.gps_ok ? "Fixed" : "No fix"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Motion</span>
                  <span className="font-medium text-foreground">{d?.motion ?? "—"}</span>
                </div>
              </div>
            </div>

            {logs.length > 1 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Vitals History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Time", "HR", "SpO₂", "Temp", "Bat", "Sig"].map((col) => (
                          <th key={col} className="py-1.5 pr-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide last:pr-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 15).map((log) => {
                        const ld = log.data;
                        return (
                          <tr key={log._id} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-3 text-[10px] font-mono text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</td>
                            <td className="py-2 pr-3 text-xs font-medium text-foreground">{ld?.hr ?? "—"}</td>
                            <td className="py-2 pr-3 text-xs font-medium text-foreground">{ld?.spo2 != null ? `${ld.spo2}%` : "—"}</td>
                            <td className="py-2 pr-3 text-xs font-medium text-foreground">{ld?.temp != null ? `${ld.temp}°` : "—"}</td>
                            <td className="py-2 pr-3 text-xs font-medium text-foreground">{ld?.bat != null ? `${ld.bat}%` : "—"}</td>
                            <td className="py-2 pr-0 text-xs font-medium text-foreground">{ld?.sig != null ? `${ld.sig}/4` : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
