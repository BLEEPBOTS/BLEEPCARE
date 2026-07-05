import { useState } from "react";
import { CheckCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useAccount } from "@/hooks/useAccount";

const QUICK_OPTIONS = [
  { emoji: "📞", label: "Calling patient now" },
  { emoji: "🚑", label: "Dispatching emergency team" },
  { emoji: "👨‍👩‍👧", label: "Contacting next of kin" },
];

interface QuickAcknowledgeProps {
  onAcknowledge: (note: string, time: string) => void;
  acknowledged: boolean;
  ackNote?: string;
  ackTime?: string | null;
  /** Render inline (compact) for alert history rows */
  compact?: boolean;
}

export function QuickAcknowledge({
  onAcknowledge,
  acknowledged,
  ackNote,
  ackTime,
  compact = false,
}: QuickAcknowledgeProps) {
  const { data: account } = useAccount();
  const [showPanel, setShowPanel] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customNote, setCustomNote] = useState("");

  const userName = account?.name ?? "Loading...";

  function handleQuickSelect(label: string) {
    const time = format(new Date(), "HH:mm, MMM d");
    onAcknowledge(label, time);
    setShowPanel(false);
  }

  function handleCustomSubmit() {
    if (!customNote.trim()) return;
    const time = format(new Date(), "HH:mm, MMM d");
    onAcknowledge(customNote, time);
    setShowPanel(false);
    setShowCustom(false);
    setCustomNote("");
  }

  if (acknowledged) {
    return (
      <div className={`flex items-center gap-2 rounded-xl border border-[hsl(var(--success))/30] bg-[hsl(var(--success-subtle))] ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        <CheckCheck className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} text-[hsl(var(--success))] shrink-0`} />
        <div className="min-w-0">
          <p className={`${compact ? "text-[10px]" : "text-xs"} font-semibold text-[hsl(var(--success))]`}>
            Acknowledged ✓
          </p>
          {ackNote && (
            <p className={`${compact ? "text-[9px]" : "text-[10px]"} text-foreground/70 truncate`}>
              "{ackNote}"
            </p>
          )}
<p className={`${compact ? "text-[9px]" : "text-[10px]"} text-muted-foreground`}>
             by {userName} at {ackTime}
           </p>
        </div>
      </div>
    );
  }

  if (!showPanel) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setShowPanel(true); }}
        className={`${compact ? "px-3 py-1.5 text-xs rounded-lg" : "w-full py-3 rounded-xl text-sm"} font-bold bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
      >
        <AlertCircle className={`${compact ? "h-3 w-3" : "h-4 w-4"}`} />
        Acknowledge Alert
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`space-y-2 ${compact ? "p-3 bg-card border border-border rounded-xl shadow-lg" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className={`${compact ? "text-xs" : "text-sm"} font-bold text-foreground`}>
          How are you responding?
        </p>
        <button
          onClick={() => { setShowPanel(false); setShowCustom(false); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div className={`grid ${compact ? "grid-cols-1 gap-1.5" : "grid-cols-2 gap-2"}`}>
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleQuickSelect(opt.label)}
            className={`flex items-center gap-2 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"} rounded-xl border border-border bg-secondary hover:bg-[hsl(var(--warning-subtle))] hover:border-[hsl(var(--warning))/40] transition-all text-left font-medium text-foreground`}
          >
            <span className={compact ? "text-base" : "text-lg"}>{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`flex items-center gap-2 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"} rounded-xl border border-border bg-secondary hover:bg-[hsl(var(--warning-subtle))] hover:border-[hsl(var(--warning))/40] transition-all text-left font-medium text-foreground ${showCustom ? "border-[hsl(var(--warning))/50] bg-[hsl(var(--warning-subtle))]" : ""}`}
        >
          <span className={compact ? "text-base" : "text-lg"}>✍️</span>
          Other — type your response
        </button>
      </div>

      {showCustom && (
        <div className="space-y-2">
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Type your response…"
            className={`w-full ${compact ? "text-xs h-14" : "text-sm h-16"} bg-background border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--warning))] text-foreground placeholder:text-muted-foreground`}
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customNote.trim()}
            className={`${compact ? "px-4 py-1.5 text-xs rounded-lg" : "w-full py-2 rounded-lg text-sm"} font-semibold bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] disabled:opacity-40 hover:opacity-90 transition-opacity`}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
