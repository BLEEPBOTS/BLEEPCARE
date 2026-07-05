import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Patient } from "@/types";

interface PatientMapProps {
  patients: Patient[];
}

function getStatusColor(status: Patient["status"]) {
  switch (status) {
    case "critical": return "#ef4444";
    case "warning":  return "#f97316";
    case "normal":   return "#22c55e";
  }
}

function getStatusBorder(status: Patient["status"]) {
  switch (status) {
    case "critical": return "#dc2626";
    case "warning":  return "#ea580c";
    case "normal":   return "#16a34a";
  }
}

function createPinIcon(patient: Patient): L.DivIcon {
  const color  = getStatusColor(patient.status);
  const border = getStatusBorder(patient.status);
  const pulse  = patient.status === "critical";
  const fall   = patient.fall_detected;

  const pulseRing = pulse ? `
    <span style="
      position:absolute;inset:-6px;border-radius:50%;
      background:${color};opacity:.35;
      animation:pinPulse 1.6s ease-out infinite;
      pointer-events:none;
    "></span>` : "";

  const fallIcon = fall ? `<span style="
    position:absolute;top:-1px;right:-1px;font-size:8px;line-height:1;
    background:#fff;border-radius:50%;width:12px;height:12px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 0 1px ${border};
  ">⚠</span>` : "";

  return L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
    html: `
      <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
        ${pulseRing}
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:${color};border:2.5px solid ${border};
          box-shadow:0 2px 8px ${color}60;
          display:flex;align-items:center;justify-content:center;
          position:relative;z-index:1;
        ">
          <span style="font-size:11px;font-weight:800;color:#fff;line-height:1;">
            ${patient.name.split(" ").map(n => n[0]).join("").slice(0,2)}
          </span>
        </div>
        ${fallIcon}
      </div>
    `,
  });
}

export default function PatientMap({ patients }: PatientMapProps) {
  const mapRef    = useRef<L.Map | null>(null);
  const divRef    = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const navigate  = useNavigate();

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const map = L.map(divRef.current, {
      center: [1.3733, 32.2903],
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Inject pulse keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pinPulse {
        0%   { transform: scale(0.9); opacity: .45; }
        70%  { transform: scale(2.0); opacity: 0; }
        100% { transform: scale(0.9); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      document.head.removeChild(style);
    };
  }, []);

  // Add/refresh markers whenever patients change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    patients.forEach(patient => {
      if (patient.gps_lat == null || patient.gps_lng == null) return;
      const marker = L.marker([patient.gps_lat, patient.gps_lng], {
        icon: createPinIcon(patient),
      }).addTo(map);

      const statusLabel =
        patient.status === "critical" ? "🔴 Critical" :
        patient.status === "warning"  ? "🟠 Warning"  : "🟢 Stable";

      const fallRow = patient.fall_detected
        ? `<tr><td style="color:#ef4444;font-weight:600;padding:1px 0" colspan="2">⚠ Fall Detected</td></tr>`
        : "";

      const hr  = patient.current_vitals?.heart_rate  ?? "—";
      const spo = patient.current_vitals?.spo2        ?? "—";
      const tmp = patient.current_vitals?.temperature ?? "—";

      const popupHtml = `
        <div style="font-family:system-ui,sans-serif;min-width:180px;padding:2px 0;">
          <div style="font-size:13px;font-weight:700;margin-bottom:6px;color:#0f172a">${patient.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${patient.district}</div>
          <table style="font-size:12px;border-collapse:collapse;width:100%;margin-bottom:8px;">
            <tr>
              <td style="color:#64748b;padding:2px 8px 2px 0">HR</td>
              <td style="font-weight:600;color:#0f172a">${hr} bpm</td>
            </tr>
            <tr>
              <td style="color:#64748b;padding:2px 8px 2px 0">SpO₂</td>
              <td style="font-weight:600;color:#0f172a">${spo}%</td>
            </tr>
            <tr>
              <td style="color:#64748b;padding:2px 8px 2px 0">Temp</td>
              <td style="font-weight:600;color:#0f172a">${tmp}°C</td>
            </tr>
            <tr>
              <td style="color:#64748b;padding:2px 8px 2px 0">Status</td>
              <td>${statusLabel}</td>
            </tr>
            ${fallRow}
          </table>
          <a
            href="/patients/${patient.id}"
            onclick="event.preventDefault();window.__bleepNavigate('${patient.id}')"
            style="display:inline-block;font-size:12px;font-weight:600;color:#0ea5e9;text-decoration:none;border:1px solid #0ea5e9;border-radius:5px;padding:3px 10px;"
          >View Patient →</a>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 220, className: "bleepcare-popup" });
      markersRef.current.push(marker);
    });

    // Expose navigate for popup links
    (window as any).__bleepNavigate = (id: string) => navigate(`/patients/${id}`);
  }, [patients, navigate]);

  // Fit bounds helper
  const fitAll = () => {
    const map = mapRef.current;
    if (!map || patients.length === 0) return;
    const valid = patients.filter(p => p.gps_lat != null && p.gps_lng != null);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map(p => [p.gps_lat!, p.gps_lng!]));
    map.fitBounds(bounds, { padding: [48, 48] });
  };

  return (
    <div className="relative bg-card border border-border rounded-xl shadow-card overflow-hidden animate-fade-up anim-delay-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card z-10 relative">
        <div>
          <h2 className="text-base font-bold text-foreground">Patient Locations — Live</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Uganda · GPS coordinates from BleepCare SOS devices</p>
        </div>
        <button
          onClick={fitAll}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-muted transition-colors text-foreground"
        >
          Fit all patients
        </button>
      </div>

      {/* Map container */}
      <div className="relative" style={{ height: 400 }}>
        <div ref={divRef} style={{ width: "100%", height: "100%" }} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card text-xs space-y-1.5">
          <p className="font-semibold text-foreground mb-1">Status</p>
          {[
            { color: "bg-[hsl(var(--critical))]", label: "Critical" },
            { color: "bg-[hsl(var(--warning))]",  label: "Warning" },
            { color: "bg-[hsl(var(--success))]",  label: "Stable" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 border-t border-border pt-1.5 mt-1">
            <span className="text-[10px]">⚠</span>
            <span className="text-muted-foreground">Fall detected</span>
          </div>
        </div>
      </div>

      {/* Popup style overrides */}
      <style>{`
        .bleepcare-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          padding: 0;
        }
        .bleepcare-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .bleepcare-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
    </div>
  );
}
