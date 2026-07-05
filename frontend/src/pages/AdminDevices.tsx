import { useNavigate } from "react-router-dom";
import { useAllDevices, type Device } from "@/hooks/useDevice";
import {
  Cpu,
  ChevronRight,
  Building2,
  User,
  Calendar,
  Plus,
  Activity,
  Power,
  PowerOff,
} from "lucide-react";
import { format } from "date-fns";

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

export default function AdminDevices() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useAllDevices();
  const devices: Device[] = data?.data ?? [];

  const active = devices.filter((d) => d.status === "active").length;
  const inactive = devices.filter((d) => d.status === "inactive").length;
  const assigned = devices.filter(
    (d) => d.careGiver || d.patient,
  ).length;

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
            Failed to load devices
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Devices
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {devices.length} device{devices.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => navigate("/devices/create")}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Device
        </button>
      </div>

      {devices.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Cpu} label="Total Devices" value={devices.length} />
          <StatCard icon={Activity} label="Active" value={active} />
          <StatCard icon={PowerOff} label="Inactive" value={inactive} />
          <StatCard icon={User} label="Assigned" value={assigned} />
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "Serial Number",
                  "Code",
                  "Hospital",
                  "Patient",
                  "Care Giver",
                  "Status",
                  "Created",
                ].map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide first:pl-6 last:pr-6"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr
                  key={d._id}
                  className="border-b border-border hover:bg-muted/30 transition-colors group last:border-0"
                >
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Cpu className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                        {d.serialNumber}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {d.deviceCode}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {d.hospital && typeof d.hospital === "object"
                      ? d.hospital.name
                      : <span className="text-muted-foreground/60">&mdash;</span>}
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {d.patient && typeof d.patient === "object"
                      ? d.patient.name
                      : <span className="text-muted-foreground/60">&mdash;</span>}
                  </td>
                  <td className="py-4 px-4">
                    {d.careGiver && typeof d.careGiver === "object" ? (
                      <div>
                        <p className="text-sm text-foreground">
                          {d.careGiver.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.careGiver.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground/60">
                        &mdash;
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        d.status === "active"
                          ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
                          : "text-muted-foreground bg-muted"
                      }`}
                    >
                      {d.status === "active" ? (
                        <Power className="h-3 w-3" />
                      ) : (
                        <PowerOff className="h-3 w-3" />
                      )}
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(d.createdAt), "MMM d, yyyy")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 ml-2" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Cpu className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No devices registered yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Register your first device to start monitoring patients and
              assigning care providers.
            </p>
            <button
              onClick={() => navigate("/devices/create")}
              className="mt-5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add the first device
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
