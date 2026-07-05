import React from "react";
import logoSrc from "@/assets/bleepbots-logo.png";

const AuthPageAside = () => {
  return (
    <div
      className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A1628 0%, #0D2137 100%)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={logoSrc}
            alt="BleepBots"
            className="w-[180px] h-auto object-contain"
          />
        </div>
        <h1 className="text-white text-4xl font-bold leading-tight mb-4">
          Intelligent
          <br />
          Remote Patient
          <br />
          Monitoring
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-md mb-6">
          Real-time vitals. Smart alerts. Built for caregivers who can't afford
          to miss a beat.
        </p>
        <div className="flex flex-wrap gap-2">
          {["HIPAA Compliant", "GPS Tracking", "SOS Alerts"].map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#00C896]/30 text-white font-medium"
              style={{
                fontSize: "12px",
                backgroundColor: "rgba(0, 200, 150, 0.1)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      {/* <div className="relative z-10">
          <div className="border-t border-white/10 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Vitals Update Interval", value: "30s" },
              { label: "Uptime", value: "99.97%" },
              { label: "Alert Types Monitored", value: "5" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
                <p className="text-white text-2xl font-bold leading-none mb-1">{stat.value}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div> */}
    </div>
  );
};

export default AuthPageAside;
