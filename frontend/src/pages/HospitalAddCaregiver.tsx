import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useHospitalCaregivers, useAddCareGiver } from "@/hooks/useHospitalCaregivers";
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
  Stethoscope,
  User,
  Loader2,
  Info,
} from "lucide-react";

export default function HospitalAddCaregiver() {
  const navigate = useNavigate();
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const [careGiverId, setCareGiverId] = useState("");
  const [error, setError] = useState("");

  const { data: caregivers } = useHospitalCaregivers(hospitalId ?? "");
  const { mutate: addCareGiver, isPending } = useAddCareGiver();

  const existingCareGiverIds = new Set(
    (caregivers ?? []).map((cg) => cg.id),
  );

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["eligible-caregivers", hospitalId],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers();
      if (error) throw error;
      return data.users.filter(
        (u) =>
          u.role !== "admin" &&
          u.role !== "hospitalAdmin" &&
          !existingCareGiverIds.has(u.id),
      );
    },
    enabled: !!hospitalId,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!careGiverId.trim()) {
      setError("Please select a care giver.");
      return;
    }

    addCareGiver(
      { hospitalId: hospitalId!, careGiverId: careGiverId.trim() },
      {
        onSuccess: () => {
          navigate(`/hospitals/${hospitalId}/caregivers`);
        },
        onError: (err: any) => {
          setError(
            err?.message || "Failed to add care giver. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate(`/hospitals/${hospitalId}/caregivers`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Care Givers
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Add Care Giver
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign an existing user as a care provider for this hospital
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium">
          <Stethoscope className="h-3.5 w-3.5" />
          New Assignment
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-0.5">
            About care giver assignment
          </p>
          <p>
            Select an existing user to become a care giver. Their role will be
            updated to &quot;careGiver&quot; and they will be linked to this
            hospital. Only users who are not already admins or care givers at
            this hospital are shown.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm"
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <User className="h-4 w-4 text-accent" />
            Select User <span className="text-[hsl(var(--critical))]">*</span>
          </label>
          <Select value={careGiverId} onValueChange={setCareGiverId}>
            <SelectTrigger className="w-full border-input bg-background text-sm text-foreground">
              <SelectValue
                placeholder={
                  usersLoading
                    ? "Loading users..."
                    : users?.length === 0
                      ? "No eligible users"
                      : "Select a user"
                }
              />
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
            Only users who are not admins or hospital admins and not already
            assigned to this hospital are listed.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--critical))] bg-[hsl(var(--critical-subtle))] border border-[hsl(var(--critical))/25] rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !careGiverId}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Care Giver"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/hospitals/${hospitalId}/caregivers`)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
