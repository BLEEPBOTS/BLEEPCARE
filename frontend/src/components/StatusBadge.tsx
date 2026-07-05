import type { VitalStatus } from "@/types";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: VitalStatus;
  size?: "sm" | "md";
}

const config: Record<VitalStatus, { label: string; className: string; Icon: React.FC<{ className?: string }> }> = {
  normal: { label: "Stable", className: "status-normal", Icon: CheckCircle },
  warning: { label: "Warning", className: "status-warning", Icon: AlertTriangle },
  critical: { label: "Critical", className: "status-critical", Icon: AlertCircle },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { label, className, Icon } = config[status];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className,
      ].join(" ")}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
