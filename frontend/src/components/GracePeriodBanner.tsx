import { AlertTriangle } from "lucide-react";
import { useLicense } from "@/stores/licenseStore";

export function GracePeriodBanner() {
  const { licenseStatus, graceDaysRemaining } = useLicense();
  if (licenseStatus !== "grace_period") return null;

  return (
    <div className="w-full bg-[hsl(var(--warning))] px-5 py-2.5 flex items-center gap-3 shrink-0 z-50">
      <AlertTriangle className="h-4 w-4 text-white shrink-0" />
      <p className="text-white text-sm font-semibold flex-1">
        ⚠ Payment Overdue — Your subscription will be suspended in{" "}
        <strong>{graceDaysRemaining} days</strong>.{" "}
        <a
          href="https://admin.bleepcare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          Renew now at admin.bleepcare.com
        </a>
      </p>
    </div>
  );
}
