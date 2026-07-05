import { useRef, useEffect } from "react";

interface ColorStop {
  pos: number;
  color: [number, number, number]; // RGB
}

interface GaugeVitalProps {
  value: number;
  min: number;
  max: number;
  displayValue: string;
  unit: string;
  minLabel: string;
  maxLabel: string;
  colorMap: ColorStop[];
  isCritical: boolean;
  iconType: "ecg" | "lungs" | "thermometer";
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function getGradientColor(colorMap: ColorStop[], fraction: number): [number, number, number] {
  if (fraction <= colorMap[0].pos) return colorMap[0].color;
  if (fraction >= colorMap[colorMap.length - 1].pos) return colorMap[colorMap.length - 1].color;
  for (let i = 0; i < colorMap.length - 1; i++) {
    if (fraction >= colorMap[i].pos && fraction <= colorMap[i + 1].pos) {
      const t = (fraction - colorMap[i].pos) / (colorMap[i + 1].pos - colorMap[i].pos);
      return lerpColor(colorMap[i].color, colorMap[i + 1].color, t);
    }
  }
  return colorMap[colorMap.length - 1].color;
}

function rgbStr(c: [number, number, number]) {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const W = 168;
const H = 152;
const CX = W / 2;
const CY = 78;
const R = 58;
const ARC_WIDTH = 15;
const START_ANGLE = Math.PI * 0.75; // Fix 5: symmetric 270° arc
const TOTAL_SWEEP = Math.PI * 1.5; // 270 degrees
const SEGMENTS = 300;

function drawGauge(ctx: CanvasRenderingContext2D, props: GaugeVitalProps, dpr: number) {
  const { value, min, max, displayValue, unit, minLabel, maxLabel, colorMap, isCritical, iconType } = props;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const fraction = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const valueColor = getGradientColor(colorMap, fraction);

  // Outer ring border
  ctx.beginPath();
  ctx.arc(CX, CY, R + ARC_WIDTH / 2 + 3, 0, Math.PI * 2);
  ctx.strokeStyle = "#0c1828";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner ring border
  ctx.beginPath();
  ctx.arc(CX, CY, R - ARC_WIDTH / 2 - 3, 0, Math.PI * 2);
  ctx.strokeStyle = "#0c1828";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner circle fill
  ctx.beginPath();
  ctx.arc(CX, CY, R - ARC_WIDTH / 2 - 3, 0, Math.PI * 2);
  ctx.fillStyle = "#060c14";
  ctx.fill();
  ctx.strokeStyle = "#0c1828";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw smooth gradient arc (300 segments)
  for (let i = 0; i < SEGMENTS; i++) {
    const t0 = i / SEGMENTS;
    const t1 = (i + 1) / SEGMENTS;
    const a0 = START_ANGLE - t0 * TOTAL_SWEEP;
    const a1 = START_ANGLE - t1 * TOTAL_SWEEP;
    const color = getGradientColor(colorMap, t0);

    ctx.beginPath();
    ctx.arc(CX, CY, R, a0, a1, true);
    ctx.strokeStyle = rgbStr(color);
    ctx.lineWidth = ARC_WIDTH;
    ctx.lineCap = "butt";
    ctx.stroke();
  }

  // Round caps at start and end
  for (const t of [0, 1]) {
    const a = START_ANGLE - t * TOTAL_SWEEP;
    const x = CX + R * Math.cos(a);
    const y = CY + R * Math.sin(a);
    const color = getGradientColor(colorMap, t);
    ctx.beginPath();
    ctx.arc(x, y, ARC_WIDTH / 2, 0, Math.PI * 2);
    ctx.fillStyle = rgbStr(color);
    ctx.fill();
  }

  // Five tick marks evenly spaced
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    const a = START_ANGLE - t * TOTAL_SWEEP;
    const innerR = R - ARC_WIDTH / 2 - 1;
    const outerR = R + ARC_WIDTH / 2 + 1;
    ctx.beginPath();
    ctx.moveTo(CX + innerR * Math.cos(a), CY + innerR * Math.sin(a));
    ctx.lineTo(CX + outerR * Math.cos(a), CY + outerR * Math.sin(a));
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.lineCap = "butt";
    ctx.stroke();
  }

  // White tick mark at current value position
  const valueAngle = START_ANGLE - fraction * TOTAL_SWEEP;
  const tickInner = R - ARC_WIDTH / 2;
  const tickOuter = R + ARC_WIDTH / 2;
  ctx.beginPath();
  ctx.moveTo(CX + tickInner * Math.cos(valueAngle), CY + tickInner * Math.sin(valueAngle));
  ctx.lineTo(CX + tickOuter * Math.cos(valueAngle), CY + tickOuter * Math.sin(valueAngle));
  ctx.strokeStyle = "rgba(255,255,255,1.0)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Value text - bold centered
  ctx.fillStyle = rgbStr(valueColor);
  ctx.font = "bold 28px ui-monospace, SFMono-Regular, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayValue, CX, CY - 4);

  // Unit label
  ctx.fillStyle = "#6b7a8d";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(unit, CX, CY + 16);

  // Icon below unit label
  drawIcon(ctx, iconType, CX, CY + 32, rgbStr(valueColor));

  // Min/max labels
  const minAngle = START_ANGLE;
  const maxAngle = START_ANGLE - TOTAL_SWEEP;
  const labelR = R + ARC_WIDTH / 2 + 12;

  ctx.fillStyle = "#4a5568";
  ctx.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(minLabel, CX + labelR * Math.cos(minAngle), CY + labelR * Math.sin(minAngle));
  ctx.fillText(maxLabel, CX + labelR * Math.cos(maxAngle), CY + labelR * Math.sin(maxAngle));

  // Status badge below gauge
  const badgeY = H - 14;
  const badgeText = isCritical ? "⚠ CRITICAL" : "✓ NORMAL";
  const badgeBg = isCritical ? "rgba(204,21,0,0.25)" : "rgba(0,170,85,0.2)";
  const badgeFg = isCritical ? "#cc1500" : "#00aa55";
  const badgeBorder = isCritical ? "rgba(204,21,0,0.5)" : "rgba(0,170,85,0.4)";

  ctx.font = "bold 8.5px -apple-system, BlinkMacSystemFont, sans-serif";
  const pillW = W * 0.8;
  const pillH = 18;
  const pillX = CX - pillW / 2;
  const pillY = badgeY - pillH / 2;

  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 9);
  ctx.fillStyle = badgeBg;
  ctx.fill();
  ctx.strokeStyle = badgeBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = badgeFg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, CX, badgeY);

  ctx.restore();
}

function drawIcon(ctx: CanvasRenderingContext2D, type: string, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = "none";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (type === "ecg") {
    // ECG wave
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx - 8, cy);
    ctx.lineTo(cx - 5, cy - 6);
    ctx.lineTo(cx - 2, cy + 4);
    ctx.lineTo(cx + 2, cy - 8);
    ctx.lineTo(cx + 5, cy + 3);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx + 14, cy);
    ctx.stroke();
  } else if (type === "lungs") {
    // Two lung lobes
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.bezierCurveTo(cx - 3, cy - 6, cx - 8, cy - 4, cx - 9, cy + 1);
    ctx.bezierCurveTo(cx - 10, cy + 5, cx - 6, cy + 7, cx - 3, cy + 6);
    ctx.lineTo(cx, cy + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.bezierCurveTo(cx + 3, cy - 6, cx + 8, cy - 4, cx + 9, cy + 1);
    ctx.bezierCurveTo(cx + 10, cy + 5, cx + 6, cy + 7, cx + 3, cy + 6);
    ctx.lineTo(cx, cy + 2);
    ctx.stroke();
  } else if (type === "thermometer") {
    // Thermometer stem + bulb
    ctx.beginPath();
    ctx.roundRect(cx - 2.5, cy - 7, 5, 10, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export function GaugeVital(props: GaugeVitalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGauge(ctx, props, dpr);
  }, [props.value, props.isCritical]);

  return <canvas ref={canvasRef} style={{ width: W, height: H }} />;
}

// ─── Color maps ──────────────────────────────────────────────────────────────

export const HR_COLOR_MAP: ColorStop[] = [
  { pos: 0.00, color: [204, 21, 0] },
  { pos: 0.20, color: [204, 21, 0] },
  { pos: 0.25, color: [204, 136, 0] },
  { pos: 0.35, color: [0, 170, 85] },
  { pos: 0.50, color: [0, 170, 85] },
  { pos: 0.58, color: [204, 136, 0] },
  { pos: 0.65, color: [204, 21, 0] },
  { pos: 1.00, color: [204, 21, 0] },
];

export const SPO2_COLOR_MAP: ColorStop[] = [
  { pos: 0.00, color: [204, 21, 0] },
  { pos: 0.40, color: [204, 21, 0] },
  { pos: 0.55, color: [204, 136, 0] },
  { pos: 0.65, color: [0, 170, 85] },
  { pos: 1.00, color: [0, 170, 85] },
];

export const TEMP_COLOR_MAP: ColorStop[] = [
  { pos: 0.00, color: [204, 21, 0] },
  { pos: 0.17, color: [204, 21, 0] },
  { pos: 0.25, color: [204, 136, 0] },
  { pos: 0.33, color: [0, 170, 85] },
  { pos: 0.67, color: [0, 170, 85] },
  { pos: 0.75, color: [204, 136, 0] },
  { pos: 0.83, color: [204, 21, 0] },
  { pos: 1.00, color: [204, 21, 0] },
];

// ─── Fall Detection Card ────────────────────────────────────────────────────

export function FallCard({ detected }: { detected: boolean }) {
  return (
    <div
      className={`rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
        detected
          ? "border border-[#cc1500]/60 animate-pulse"
          : "border border-[#0c1828]"
      }`}
      style={{
        width: 155,
        height: 100,
        background: detected ? "#1a0505" : "#0a1018",
        boxShadow: detected ? "0 0 16px rgba(204,21,0,0.35)" : "none",
      }}
    >
      {detected ? (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cc1500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            <path d="M12 8v4"/><path d="M12 16h.01"/>
          </svg>
          <p style={{ color: "#cc1500", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Fall Detected
          </p>
          <p style={{ color: "rgba(204,21,0,0.7)", fontSize: 9 }}>Respond immediately</p>
        </>
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <p style={{ color: "#6b7a8d", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            No Fall
          </p>
          <p style={{ color: "#4a5568", fontSize: 9 }}>Not detected</p>
        </>
      )}
    </div>
  );
}

// ─── SOS Card ────────────────────────────────────────────────────────────────

export function SosCard({ active }: { active: boolean }) {
  return (
    <div
      className={`rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${
        active
          ? "border border-[#cc1500]/60 animate-pulse"
          : "border border-[#0c1828]"
      }`}
      style={{
        width: 155,
        height: 100,
        background: active ? "#1a0505" : "#0a1018",
        boxShadow: active ? "0 0 16px rgba(204,21,0,0.35)" : "none",
      }}
    >
      {active ? (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cc1500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
          </svg>
          <p style={{ color: "#cc1500", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            SOS Active
          </p>
          <p style={{ color: "rgba(204,21,0,0.7)", fontSize: 9 }}>Respond immediately</p>
        </>
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
          </svg>
          <p style={{ color: "#6b7a8d", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            No SOS
          </p>
          <p style={{ color: "#4a5568", fontSize: 9 }}>Not activated</p>
        </>
      )}
    </div>
  );
}
