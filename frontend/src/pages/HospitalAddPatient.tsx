import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePatient } from "@/hooks/usePatient";
import { useHospitalCaregivers } from "@/hooks/useHospitalCaregivers";
import { useHospital } from "@/hooks/useHospital";
import { authClient } from "@/lib/auth-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  User,
  Smartphone,
  CalendarDays,
  Activity,
  Loader2,
  Info,
} from "lucide-react";

export default function HospitalAddPatient() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const hospitalId = session?.user?.hospitalId ?? "";

  const [name, setName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [careGiverId, setCareGiverId] = useState("");
  const [error, setError] = useState("");

  const { data: hospitalRes } = useHospital(hospitalId);
  const { data: caregivers } = useHospitalCaregivers(hospitalId);
  const { mutate: createPatient, isPending } = useCreatePatient();

  const hospital = hospitalRes?.data;
  const devices = (hospital?.devices ?? []) as any[];
  const availableDevices = devices.filter((d: any) => !d.patient);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !diagnosis.trim() || !dateOfBirth || !deviceId || !careGiverId) {
      setError("All fields are required.");
      return;
    }

    createPatient(
      {
        name: name.trim(),
        diagnosis: diagnosis.trim(),
        dateOfBirth,
        device: deviceId,
        hospital: hospitalId,
        careGiver: careGiverId,
      },
      {
        onSuccess: () => {
          navigate("/patients");
        },
        onError: (err: any) => {
          setError(
            err?.message || "Failed to create patient. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate("/patients")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Patients
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Add Patient
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register a new patient and assign a device and care giver
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium">
          <Users className="h-3.5 w-3.5" />
          New Patient
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-0.5">
            About patient registration
          </p>
          <p>
            Create a new patient record and link them to an available device
            and a care giver at this hospital. The device will be marked as
            assigned once linked.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <User className="h-4 w-4 text-accent" />
              Patient Name <span className="text-[hsl(var(--critical))]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter patient name"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <CalendarDays className="h-4 w-4 text-accent" />
              Date of Birth <span className="text-[hsl(var(--critical))]">*</span>
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Activity className="h-4 w-4 text-accent" />
              Diagnosis <span className="text-[hsl(var(--critical))]">*</span>
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Hypertension"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Smartphone className="h-4 w-4 text-accent" />
              Device <span className="text-[hsl(var(--critical))]">*</span>
            </label>
            <Select value={deviceId} onValueChange={setDeviceId}>
              <SelectTrigger className="w-full border-input bg-background text-sm text-foreground">
                <SelectValue
                  placeholder={
                    availableDevices.length === 0
                      ? "No available devices"
                      : "Select a device"
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-foreground">
                {availableDevices.map((d: any) => (
                  <SelectItem
                    key={d._id}
                    value={d._id}
                    className="hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <span>
                      {d.serialNumber}{" "}
                      <span className="text-muted-foreground">({d.deviceCode})</span>
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {d.status}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground/70">
              Only devices not already assigned to a patient are shown.
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <User className="h-4 w-4 text-accent" />
              Care Giver <span className="text-[hsl(var(--critical))]">*</span>
            </label>
            <Select value={careGiverId} onValueChange={setCareGiverId}>
              <SelectTrigger className="w-full border-input bg-background text-sm text-foreground">
                <SelectValue
                  placeholder={
                    !caregivers || caregivers.length === 0
                      ? "No care givers"
                      : "Select a care giver"
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-foreground">
                {(caregivers ?? []).map((cg) => (
                  <SelectItem
                    key={cg._id}
                    value={cg._id}
                    className="hover:bg-accent/10 focus:bg-accent/10"
                  >
                    <span>
                      {cg.name}{" "}
                      <span className="text-muted-foreground">({cg.email})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--critical))] bg-[hsl(var(--critical-subtle))] border border-[hsl(var(--critical))/25] rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !name || !diagnosis || !dateOfBirth || !deviceId || !careGiverId}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Patient"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
