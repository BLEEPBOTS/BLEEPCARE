import { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Patient } from "@/hooks/usePatient";
import type { DeviceLog } from "@/hooks/useDeviceLogs";

interface CaregiverMapProps {
  patients: Patient[];
  locations: Map<string, { lat: number; lng: number }>;
  vitalsByDevice: Map<string, DeviceLog>;
  alertsByDevice: Map<string, DeviceLog[]>;
  onResolveAlert: (logId: string) => void;
  userName: string;
}

type VitalStatus = "normal" | "warning" | "critical";

function getStatusColor(status: VitalStatus) {
  switch (status) {
    case "critical": return "#ef4444";
    case "warning":  return "#f97316";
    case "normal":   return "#22c55e";
  }
}

function getStatusBorder(status: VitalStatus) {
  switch (status) {
    case "critical": return "#dc2626";
    case "warning":  return "#ea580c";
    case "normal":   return "#16a34a";
  }
}

function vitalsStatus(hr?: number, spo2?: number, temp?: number): VitalStatus {
  let worst: VitalStatus = "normal";
  if (hr != null && (hr < 40 || hr > 120)) worst = "critical";
  else if (hr != null && (hr < 60 || hr > 100)) worst = "warning";
  if (spo2 != null && spo2 < 90) worst = "critical";
  else if (spo2 != null && spo2 < 95 && worst !== "critical") worst = "warning";
  if (temp != null && (temp < 35 || temp > 39)) worst = "critical";
  else if (temp != null && (temp < 36 || temp > 37.5) && worst !== "critical") worst = "warning";
  return worst;
}

function createPinIcon(name: string, status: VitalStatus, hasAlerts: boolean): L.DivIcon {
  const color  = hasAlerts ? "#ef4444" : getStatusColor(status);
  const border = hasAlerts ? "#dc2626" : getStatusBorder(status);
  const pulse  = status === "critical" || hasAlerts;
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const pulseRing = pulse ? `
    <span style="
      position:absolute;inset:-6px;border-radius:50%;
      background:${color};opacity:.35;
      animation:caregiverPinPulse 1.6s ease-out infinite;
      pointer-events:none;
    "></span>` : "";

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
          <span style="font-size:10px;font-weight:800;color:#fff;line-height:1;letter-spacing:0.5px;">
            ${initials}
          </span>
        </div>
      </div>
    `,
  });
}

const eventTypeConfig: Record<string, { label: string; color: string }> = {
  FALL: { label: "Fall", color: "#ef4444" },
  COLLISION: { label: "Collision", color: "#f97316" },
  SOS: { label: "SOS", color: "#e11d48" },
  THRESHOLD: { label: "Threshold", color: "#f59e0b" },
  VITALS: { label: "Vitals", color: "#3b82f6" },
};

export default function CaregiverMap({
  patients,
  locations,
  vitalsByDevice,
  alertsByDevice,
  onResolveAlert,
  userName,
}: CaregiverMapProps) {
  const mapRef    = useRef<L.Map | null>(null);
  const divRef    = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const navigate  = useNavigate();

  const locatedPatients = useMemo(
    () => patients.filter((p) => {
      const deviceId = typeof p.device === "object" ? p.device?._id : null;
      return deviceId ? locations.has(deviceId) : false;
    }),
    [patients, locations],
  );

  const noLocationCount = patients.length - locatedPatients.length;

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

    const style = document.createElement("style");
    style.textContent = `
      @keyframes caregiverPinPulse {
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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    locatedPatients.forEach((p) => {
      const deviceId = typeof p.device === "object" ? p.device?._id : null;
      if (!deviceId) return;

      const loc = locations.get(deviceId);
      if (!loc) return;

      const vitals = vitalsByDevice.get(deviceId);
      const d = vitals?.data;
      const deviceAlerts = alertsByDevice.get(deviceId) ?? [];
      const status = vitalsStatus(d?.hr, d?.spo2, d?.temp);

      const marker = L.marker([loc.lat, loc.lng], {
        icon: createPinIcon(p.name, status, deviceAlerts.length > 0),
      }).addTo(map);

      const specsRow = [
        { label: "HR", value: d?.hr != null ? `${d.hr}` : "—", unit: "bpm" },
        { label: "SpO₂", value: d?.spo2 != null ? `${d.spo2}` : "—", unit: "%" },
        { label: "Temp", value: d?.temp != null ? `${d.temp}` : "—", unit: "°C" },
        { label: "Bat", value: d?.bat != null ? `${d.bat}` : "—", unit: "%" },
        { label: "Sig", value: d?.sig != null ? `${d.sig}/4` : "—", unit: "" },
      ].map(s =>
        `<span style="display:inline-flex;align-items:center;gap:2px;background:#f1f5f9;padding:1px 6px;border-radius:4px;font-size:11px;">
          <span style="color:#64748b;font-weight:500;">${s.label}</span>
          <span style="color:#0f172a;font-weight:700;">${s.value}</span>
          ${s.unit ? `<span style="color:#94a3b8;font-size:10px;">${s.unit}</span>` : ""}
        </span>`
      ).join("");

      const alertsHtml = deviceAlerts.length > 0
        ? `<div style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:8px;">
            <div style="font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
              Alerts (${deviceAlerts.length})
            </div>
            ${deviceAlerts.map(a => {
              const cfg = eventTypeConfig[a.data?.eventType ?? "VITALS"] ?? eventTypeConfig.VITALS;
              return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${cfg.color};"></span>
                <span style="font-size:11px;font-weight:600;color:#0f172a;">${cfg.label}</span>
                <span style="font-size:10px;color:#94a3b8;">${new Date(a.createdAt).toLocaleString()}</span>
                <button data-resolve="${a._id}" style="margin-left:auto;font-size:10px;font-weight:600;color:#0ea5e9;background:none;border:none;cursor:pointer;padding:1px 4px;">✓</button>
              </div>`;
            }).join("")}
          </div>`
        : "";

      const popupHtml = `
        <div style="font-family:system-ui,sans-serif;min-width:240px;padding:2px 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div>
              <div style="font-size:14px;font-weight:700;color:#0f172a;">${p.name}</div>
              <div style="font-size:10px;font-family:monospace;color:#94a3b8;">${p.patientCode}</div>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">
            ${specsRow}
          </div>
          ${alertsHtml}
          <div style="margin-top:10px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;gap:6px;">
            <button data-view="${p._id}" style="flex:1;font-size:11px;font-weight:600;color:#fff;background:#0ea5e9;border:none;border-radius:5px;padding:5px 10px;cursor:pointer;">View Patient →</button>
          </div>
        </div>
      `;

      const popup = L.popup({ maxWidth: 280, className: "caregiver-popup" }).setContent(popupHtml);
      marker.bindPopup(popup);

      marker.on("popupopen", () => {
        const container = marker.getPopup()?.getElement();
        if (!container) return;

        container.querySelectorAll("[data-resolve]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            onResolveAlert((btn as HTMLElement).dataset.resolve!);
          });
        });

        container.querySelectorAll("[data-view]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            navigate(`/patients/${(btn as HTMLElement).dataset.view}`);
          });
        });
      });

      markersRef.current.push(marker);
    });

    const fitAll = () => {
      if (locatedPatients.length === 0) return;
      const valid = locatedPatients
        .map(p => {
          const deviceId = typeof p.device === "object" ? p.device?._id : null;
          return deviceId ? locations.get(deviceId) : null;
        })
        .filter((l): l is { lat: number; lng: number } => l != null);
      if (valid.length === 0) return;
      const bounds = L.latLngBounds(valid.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [48, 48] });
    };

    if (locatedPatients.length > 0) {
      setTimeout(fitAll, 100);
    }

    (window as any).__caregiverFitAll = fitAll;
  }, [locatedPatients, locations, vitalsByDevice, alertsByDevice, navigate, onResolveAlert]);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">Patient Locations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locatedPatients.length} patient{locatedPatients.length !== 1 ? "s" : ""} with GPS data
            {noLocationCount > 0 ? ` · ${noLocationCount} without location` : ""}
          </p>
        </div>
        <button
          onClick={() => (window as any).__caregiverFitAll?.()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-muted transition-colors text-foreground"
        >
          Fit all
        </button>
      </div>

      <div className="relative" style={{ height: 360 }}>
        <div ref={divRef} style={{ width: "100%", height: "100%" }} />
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-card text-xs space-y-1.5">
          <p className="font-semibold text-foreground mb-1">Status</p>
          {[
            { color: "bg-red-500", label: "Critical" },
            { color: "bg-orange-500", label: "Warning" },
            { color: "bg-emerald-500", label: "Normal" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .caregiver-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          padding: 0;
        }
        .caregiver-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .caregiver-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
    </div>
  );
}
