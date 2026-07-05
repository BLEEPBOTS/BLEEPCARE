import { useNavigate } from "react-router-dom";
import { useAllHospitals, type Hospital } from "@/hooks/useHospital";
import { useAllDevices, type Device } from "@/hooks/useDevice";
import {
  Building2,
  Cpu,
  Users,
  MapPin,
  Power,
  PowerOff,
  ChevronRight,
  ArrowRight,
  Activity,
  Stethoscope,
} from "lucide-react";

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: hData, isLoading: hLoading, error: hError } = useAllHospitals();
  const { data: dData, isLoading: dLoading, error: dError } = useAllDevices();

  const hospitals: Hospital[] = hData?.data ?? [];
  const devices: Device[] = dData?.data ?? [];

  const isLoading = hLoading || dLoading;
  const error = hError || dError;

  const totals = hospitals.reduce(
    (acc, h) => ({
      patients: acc.patients + (h.patients?.length ?? 0),
      caregivers: acc.careGivers?.length ?? 0 + (h.careGivers?.length ?? 0),
    }),
    { patients: 0, caregivers: 0 },
  );

  const activeDevices = devices.filter((d) => d.status === "active").length;
  const inactiveDevices = devices.filter((d) => d.status === "inactive").length;

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

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""},{" "}
          {devices.length} device{devices.length !== 1 ? "s" : ""} across the platform
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Hospitals" value={hospitals.length} />
        <StatCard icon={Cpu} label="Total Devices" value={devices.length} />
        <StatCard icon={Activity} label="Devices Active" value={activeDevices} />
        <StatCard icon={Users} label="Total Patients" value={totals.patients} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Hospitals</h2>
            <button
              onClick={() => navigate("/hospitals")}
              className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Name", "Location", "Code", "Devices", "Patients", ""].map(
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
                {hospitals.slice(0, 5).map((h) => (
                  <tr
                    key={h._id}
                    onClick={() => navigate(`/hospitals/${h._id}`)}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group last:border-0"
                  >
                    <td className="py-3 pl-6 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                          {h.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {h.location}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {h.hospitalCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-mono text-muted-foreground">
                          {h.devices?.length ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-mono text-muted-foreground">
                          {h.patients?.length ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pl-4 pr-6">
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hospitals.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium text-sm">
                No hospitals registered yet
              </p>
              <button
                onClick={() => navigate("/hospitals/create")}
                className="mt-3 text-xs text-accent hover:text-accent/80 font-medium"
              >
                Create your first hospital
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Device Status
            </h2>
            {devices.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Cpu className="h-8 w-8 text-muted-foreground/30 mb-2" />
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
                      width: `${devices.length > 0 ? (activeDevices / devices.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {devices.length > 0
                    ? `${Math.round((activeDevices / devices.length) * 100)}% of devices active`
                    : "No devices to report"}
                </p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Platform Summary
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Care Providers</span>
                </div>
                <span className="font-semibold text-foreground">
                  {totals.caregivers}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <PowerOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Unused Devices</span>
                </div>
                <span className="font-semibold text-foreground">
                  {devices.filter((d) => !d.careGiver && !d.patient).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Power className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Avg devices / hospital</span>
                </div>
                <span className="font-semibold text-foreground">
                  {hospitals.length > 0
                    ? (devices.length / hospitals.length).toFixed(1)
                    : "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/hospitals")}
              className="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              Hospitals
            </button>
            <button
              onClick={() => navigate("/devices")}
              className="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Cpu className="h-3.5 w-3.5" />
              Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
