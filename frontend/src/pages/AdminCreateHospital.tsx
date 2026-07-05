import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCreateHospital } from "@/hooks/useHospital";
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
  Building2,
  MapPin,
  User,
  Loader2,
  Hospital,
  Info,
} from "lucide-react";

export default function AdminCreateHospital() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [managerId, setManagerId] = useState("");
  const [error, setError] = useState("");

  const { mutate: createHospital, isPending } = useCreateHospital();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !location.trim() || !managerId.trim()) {
      setError("Name, location, and manager are required.");
      return;
    }

    createHospital(
      {
        name: name.trim(),
        location: location.trim(),
        managerId: managerId.trim(),
      },
      {
        onSuccess: () => {
          navigate("/hospitals");
        },
        onError: (err: any) => {
          setError(err?.message || "Failed to create hospital. Please try again.");
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate("/hospitals")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Hospitals
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Create Hospital
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Register a new hospital on BleepCare
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium">
          <Hospital className="h-3.5 w-3.5" />
          New Registration
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-0.5">About hospital registration</p>
          <p>
            Each hospital receives a unique 8-character code upon creation. A manager must be
            assigned — they will oversee devices, patients, and care providers at this facility.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm"
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <Building2 className="h-4 w-4 text-accent" />
            Hospital Name <span className="text-[hsl(var(--critical))]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mulago National Referral Hospital"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30 transition-all"
            required
          />
          <p className="text-xs text-muted-foreground/70">
            The full legal or operating name of the healthcare facility.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <MapPin className="h-4 w-4 text-accent" />
            Location <span className="text-[hsl(var(--critical))]">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kampala, Uganda"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30 transition-all"
            required
          />
          <p className="text-xs text-muted-foreground/70">
            City and country where the hospital is located.
          </p>
        </div>

        <ManagerSelect value={managerId} onChange={setManagerId} />

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
              "Create Hospital"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/hospitals")}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ManagerSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: users, isLoading } = useQuery({
    queryKey: ["non-admin-users"],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers();
      if (error) throw error;
      return data.users.filter((u) => u.role !== "admin");
    },
  });

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        <User className="h-4 w-4 text-accent" />
        Manager <span className="text-[hsl(var(--critical))]">*</span>
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-input bg-background text-sm text-foreground">
          <SelectValue placeholder={isLoading ? "Loading users..." : "Select a manager"} />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover text-foreground">
          {users?.map((u) => (
            <SelectItem
              key={u.id}
              value={u.id}
              className="hover:bg-accent/10 focus:bg-accent/10"
            >
              <span>
                {u.name || "Unnamed"}{" "}
                <span className="text-muted-foreground">({u.email})</span>
                <span className="ml-2 text-[10px] uppercase tracking-wide text-accent">
                  {u.role}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground/70">
        The selected user will be set as the hospital manager and will have
        administrative access for this facility.
      </p>
    </div>
  );
}
