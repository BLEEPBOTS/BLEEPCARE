import { useNavigate, useParams } from "react-router-dom";
import { useHospitalCaregivers } from "@/hooks/useHospitalCaregivers";
import {
  Stethoscope,
  ChevronRight,
  Mail,
  Plus,
  Shield,
} from "lucide-react";

export default function HospitalCaregivers() {
  const navigate = useNavigate();
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { data: caregivers, isLoading, error } = useHospitalCaregivers(
    hospitalId ?? "",
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
            Failed to load caregivers
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
            Care Givers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {caregivers?.length ?? 0} care giver
            {(caregivers?.length ?? 0) !== 1 ? "s" : ""} assigned
          </p>
        </div>
        <button
          onClick={() => navigate(`/hospitals/${hospitalId}/caregivers/add`)}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Care Giver
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Name", "Email", "Role", ""].map((col) => (
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
              {(caregivers ?? []).map((cg) => (
                <tr
                  key={cg._id}
                  className="border-b border-border hover:bg-muted/30 transition-colors group last:border-0"
                >
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                        {cg.name}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {cg.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                      <Shield className="h-3 w-3" />
                      {cg.role}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-accent transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!caregivers || caregivers.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Stethoscope className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No care givers assigned
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Add care providers to this hospital to start managing patients
              and devices.
            </p>
            <button
              onClick={() =>
                navigate(`/hospitals/${hospitalId}/caregivers/add`)
              }
              className="mt-5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add the first care giver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
