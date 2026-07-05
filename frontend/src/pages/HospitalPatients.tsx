import { useNavigate } from "react-router-dom";
import { useHospitalPatients } from "@/hooks/usePatient";
import { authClient } from "@/lib/auth-client";
import { Users, ChevronRight, Plus, Activity } from "lucide-react";

export default function HospitalPatients() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const hospitalId = session?.user?.hospitalId;
  const { data: res, isLoading, error } = useHospitalPatients(
    hospitalId ?? "",
  );
  const patients = res?.data ?? [];

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
            Failed to load patients
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
            Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patients.length} patient
            {patients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/patients/add")}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Patient Code", "Name", "Diagnosis", "Care Giver", "Device", ""].map((col) => (
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
              {patients.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/patients/${p._id}`)}
                  className="border-b border-border hover:bg-muted/30 transition-colors group last:border-0 cursor-pointer"
                >
                  <td className="py-4 pl-6 pr-4">
                    <span className="text-xs font-mono font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {p.patientCode}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                        {p.name}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      {p.diagnosis}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {p.careGiver?.name ?? "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {p.device?.serialNumber ?? "—"}
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

        {patients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No patients yet
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm">
              Add a patient to this hospital to start monitoring their vitals
              and assigning devices.
            </p>
            <button
              onClick={() => navigate("/patients/add")}
              className="mt-5 px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add the first patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
