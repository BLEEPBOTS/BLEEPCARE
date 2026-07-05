import { useParams } from "react-router-dom";
import { useHospitalDevices } from "@/hooks/useDevice";
import {
  Smartphone,
  Activity,
  User,
} from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500",
  inactive: "bg-muted text-muted-foreground",
};

export default function HospitalDevices() {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { data: res, isLoading, error } = useHospitalDevices(hospitalId ?? "");
  const devices = res?.data ?? [];

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
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Devices
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {devices.length} device
          {devices.length !== 1 ? "s" : ""} at this hospital
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Device Code", "Serial Number", "Status", "Patient", "Care Giver"].map(
                  (col) => (
                    <th
                      key={col}
                      className="py-3 px-4 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide first:pl-6"
                    >
                      {col}
                    </th>
                  ),
                )}
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
                        <Smartphone className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-xs font-mono font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {d.deviceCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-foreground">
                      {d.serialNumber}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[d.status] ?? statusColors.inactive}`}
                    >
                      <Activity className="h-3 w-3" />
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {d.patient && typeof d.patient === "object" ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {d.patient.name ?? "—"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {d.patient.patientCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {(() => {
                      const deviceCG =
                        d.careGiver && typeof d.careGiver === "object"
                          ? d.careGiver
                          : null;
                      const patientCG =
                        !deviceCG &&
                        d.patient &&
                        typeof d.patient === "object"
                          ? (d.patient as any).careGiver
                          : null;
                      const cg = deviceCG ?? patientCG;
                      return cg ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {cg.name ?? cg.email}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          —
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Smartphone className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No devices at this hospital
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Devices assigned to this hospital will appear here once added by
              an admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
