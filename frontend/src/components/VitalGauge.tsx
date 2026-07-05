import { Heart, Activity, Thermometer } from "lucide-react";

type GaugeZone = "critical" | "warning" | "safe";

function getHRZone(val: number): GaugeZone {
  if (val <= 40 || val >= 120) return "critical";
  if (val <= 50 || val >= 100) return "warning";
  return "safe";
}

function getSpO2Zone(val: number): GaugeZone {
  if (val <= 88) return "critical";
  if (val <= 93) return "warning";
  return "safe";
}

function getTempZone(val: number): GaugeZone {
  if (val <= 35.0 || val >= 38.5) return "critical";
  if (val <= 35.5 || val >= 38.0) return "warning";
  return "safe";
}

const ZONE_COLORS: Record<GaugeZone, { arc: string; glow: string }> = {
  critical: { arc: "hsl(0 78% 52%)", glow: "hsl(0 78% 52%)" },
  warning:  { arc: "hsl(38 92% 50%)", glow: "hsl(38 92% 50%)" },
  safe:     { arc: "hsl(152 55% 38%)", glow: "hsl(152 55% 38%)" },
};

interface VitalGaugeProps {
  type: "hr" | "spo2" | "temp";
  value: number;
  size?: number;
}

const CONFIG = {
  hr:   { min: 0, max: 200, unit: "bpm", label: "bpm · HR", getZone: getHRZone, Icon: Heart },
  spo2: { min: 80, max: 100, unit: "%", label: "% · SpO₂", getZone: getSpO2Zone, Icon: Activity },
  temp: { min: 34, max: 40, unit: "°C", label: "°C · Temp", getZone: getTempZone, Icon: Thermometer },
};

export function VitalGauge({ type, value, size = 160 }: VitalGaugeProps) {
  const cfg = CONFIG[type];
  const zone = cfg.getZone(value);
  const colors = ZONE_COLORS[zone];

  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 10;
  const r = (size - strokeWidth * 2 - 8) / 2;

  // Arc from 135° to 405° (270° sweep)
  const startAngle = 135;
  const totalSweep = 270;
  const fraction = Math.max(0, Math.min(1, (value - cfg.min) / (cfg.max - cfg.min)));
  const sweepAngle = fraction * totalSweep;

  function polarToCart(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, sweepDeg: number) {
    if (sweepDeg <= 0) return "";
    const endDeg = startDeg + sweepDeg;
    const s = polarToCart(startDeg);
    const e = polarToCart(endDeg);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const bgPath = arcPath(startAngle, totalSweep);
  const fgPath = arcPath(startAngle, sweepAngle);

  const displayVal = type === "temp" ? value.toFixed(1) : String(Math.round(value));

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`glow-${type}-${zone}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={zone === "critical" ? 4 : 2} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {zone === "critical" && (
            <filter id={`pulse-glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Dark circular background */}
        <circle cx={cx} cy={cy} r={r + strokeWidth / 2 + 2} fill="hsl(220 20% 10%)" />
        <circle cx={cx} cy={cy} r={r + strokeWidth / 2 + 2} fill="none" stroke="hsl(220 15% 18%)" strokeWidth="1" />

        {/* Grey base arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="hsl(220 10% 25%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Coloured foreground arc */}
        <path
          d={fgPath}
          fill="none"
          stroke={colors.arc}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#glow-${type}-${zone})`}
          className={zone === "critical" ? "animate-pulse" : ""}
        />

        {/* Icon above number */}
        <foreignObject x={cx - 10} y={cy - 32} width="20" height="20">
          <div className="flex items-center justify-center w-full h-full">
            <cfg.Icon className="h-4 w-4" style={{ color: colors.arc }} />
          </div>
        </foreignObject>

        {/* Value */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.arc}
          fontSize="28"
          fontWeight="bold"
          fontFamily="ui-monospace, monospace"
        >
          {displayVal}
        </text>

        {/* Unit label */}
        <text
          x={cx}
          y={cy + 24}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(215 16% 55%)"
          fontSize="10"
        >
          {cfg.label}
        </text>
      </svg>
    </div>
  );
}

// ─── Fall Status Card ────────────────────────────────────────────────────────
export function FallStatusCard({ detected, size = 160 }: { detected: boolean; size?: number }) {
  return (
    <div
      className={`rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
        detected
          ? "bg-[hsl(var(--critical))] animate-pulse shadow-[0_0_20px_hsl(var(--critical)/0.5)]"
          : "bg-[hsl(220,20%,12%)] border border-[hsl(var(--success)/25)]"
      }`}
      style={{ width: size, height: size }}
    >
      {detected ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <p className="text-white font-bold text-xs uppercase tracking-wider">Fall Detected</p>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(152 55% 38%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          <p className="text-white font-bold text-xs uppercase tracking-wider">All Clear</p>
        </>
      )}
    </div>
  );
}

// ─── SOS Status Card ─────────────────────────────────────────────────────────
export function SosStatusCard({ active, size = 160 }: { active: boolean; size?: number }) {
  return (
    <div
      className={`rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
        active
          ? "bg-[hsl(var(--critical))] animate-pulse shadow-[0_0_20px_hsl(var(--critical)/0.5)]"
          : "bg-[hsl(220,20%,12%)] border border-[hsl(220,10%,25%)]"
      }`}
      style={{ width: size, height: size }}
    >
      {active ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <p className="text-white font-bold text-xs uppercase tracking-wider">SOS Active</p>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(215 16% 45%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <p className="text-[hsl(215,16%,55%)] font-bold text-xs uppercase tracking-wider">No SOS</p>
        </>
      )}
    </div>
  );
}
