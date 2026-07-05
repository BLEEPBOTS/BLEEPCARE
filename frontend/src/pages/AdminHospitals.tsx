import { useNavigate } from "react-router-dom";
import { useAllHospitals, type AdminHospital } from "@/hooks/useHospital";
import {
  Building2,
  ChevronRight,
  Users,
  Cpu,
  Calendar,
  Stethoscope,
  Plus,
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

export default function AdminHospitals() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useAllHospitals();
  const hospitals: AdminHospital[] = data?.data ?? [];

  const totals = hospitals.reduce(
    (acc, h) => ({
      devices: acc.devices + (h.devices?.length ?? 0),
      patients: acc.patients + (h.patients?.length ?? 0),
      caregivers: acc.careGivers?.length ?? 0 + (h.careGivers?.length ?? 0),
    }),
    { devices: 0, patients: 0, caregivers: 0 },
  );

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
            Failed to load hospitals
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
            Hospital Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""}{" "}
            registered
          </p>
        </div>
        <button
          onClick={() => navigate("/hospitals/create")}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Hospital
        </button>
      </div>

      {hospitals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Total Hospitals"
            value={hospitals.length}
          />
          <StatCard icon={Cpu} label="Total Devices" value={totals.devices} />
          <StatCard
            icon={Users}
            label="Total Patients"
            value={totals.patients}
          />
          <StatCard
            icon={Stethoscope}
            label="Care Providers"
            value={totals.caregivers}
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  "Hospital",
                  "Location",
                  "Code",
                  "Manager",
                  "Devices",
                  "Patients",
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
              {hospitals.map((h) => (
                <tr
                  key={h._id}
                  onClick={() => navigate(`/hospitals/${h._id}`)}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer group last:border-0"
                >
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                        {h.name}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {h.location}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {h.hospitalCode}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {h.managerId && typeof h.managerId === "object" ? (
                      <div>
                        <p className="text-sm text-foreground">
                          {h.managerId.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {h.managerId.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground/60">
                        —
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {h.devices?.length ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {h.patients?.length ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(h.createdAt), "MMM d, yyyy")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent transition-colors ml-2" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hospitals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No hospitals registered yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Create your first hospital to start managing devices, patients,
              and care providers.
            </p>
            <button
              onClick={() => navigate("/hospitals/create")}
              className="mt-5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add the first hospital
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
