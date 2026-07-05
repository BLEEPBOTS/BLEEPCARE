import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDevice } from "@/hooks/useDevice";
import { useAllHospitals } from "@/hooks/useHospital";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Cpu,
  Building2,
  Loader2,
  Activity,
  Info,
} from "lucide-react";

export default function AdminCreateDevice() {
  const navigate = useNavigate();
  const [serialNumber, setSerialNumber] = useState("");
  const [hospital, setHospital] = useState("");
  const [error, setError] = useState("");

  const { mutate: createDevice, isPending } = useCreateDevice();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!serialNumber.trim() || !hospital.trim()) {
      setError("Serial number and hospital are required.");
      return;
    }

    createDevice(
      {
        serialNumber: serialNumber.trim(),
        hospital: hospital.trim(),
      },
      {
        onSuccess: () => {
          navigate("/devices");
        },
        onError: (err: any) => {
          setError(err?.message || "Failed to create device. Please try again.");
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate("/devices")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Devices
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Create Device
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register a new monitoring device on BleepCare
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium">
          <Activity className="h-3.5 w-3.5" />
          New Device
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-0.5">
            About device registration
          </p>
          <p>
            Each device receives a unique 8-character code upon creation and
            must be assigned to a hospital. Patient and care giver can be linked
            later.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm"
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <Cpu className="h-4 w-4 text-accent" />
            Serial Number <span className="text-[hsl(var(--critical))]">*</span>
          </label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g. BLEEP-00123"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30 transition-all"
            required
          />
          <p className="text-xs text-muted-foreground/70">
            The unique serial number printed on the device hardware.
          </p>
        </div>

        <HospitalSelect value={hospital} onChange={setHospital} />

        {error && (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--critical))] bg-[hsl(var(--critical-subtle))] border border-[hsl(var(--critical))/25] rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Device"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/devices")}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function HospitalSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data, isLoading } = useAllHospitals();
  const hospitals = data?.data ?? [];

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        <Building2 className="h-4 w-4 text-accent" />
        Hospital <span className="text-[hsl(var(--critical))]">*</span>
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-input bg-background text-sm text-foreground">
          <SelectValue
            placeholder={isLoading ? "Loading hospitals..." : "Select a hospital"}
          />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover text-foreground">
          {hospitals.map((h) => (
            <SelectItem
              key={h._id}
              value={h._id}
              className="hover:bg-accent/10 focus:bg-accent/10"
            >
              <span>
                {h.name}
                <span className="ml-2 text-muted-foreground">
                  ({h.location})
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground/70">
        The hospital this device belongs to.
      </p>
    </div>
  );
}
