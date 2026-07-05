import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Building2,
  Shield,
  HeartPulse,
  Smartphone,
  Bell,
  Activity,
  ArrowRight,
  ExternalLink,
  Mail,
  Clock,
  HelpCircle,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function NewUserDashboard() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? "there";
  const email = user?.email ?? "—";
  const role = user?.role ?? "User";

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Welcome, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {email} &middot; {role}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={User}
          label="Complete Your Profile"
          description="Set up your name and account details so your team can recognize you."
        />
        <StatCard
          icon={Building2}
          label="Get Assigned to a Hospital"
          description="Contact an admin to link you to a hospital and unlock your role."
        />
        <StatCard
          icon={HeartPulse}
          label="Patient Monitoring"
          description="Once assigned, monitor patient vitals, receive alerts, and manage devices."
        />
        <StatCard
          icon={Shield}
          label="Role-Based Access"
          description="Your dashboard adapts automatically based on your assigned role."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">About Bleep</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bleep is a real-time patient monitoring platform that connects caregivers
              with patients through smart wearable devices.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: HeartPulse, label: "Live Vitals", desc: "Heart rate, SpO₂, temperature, and more — updated in real time." },
                { icon: Bell, label: "Smart Alerts", desc: "Instant notifications for falls, collisions, SOS signals, and threshold breaches." },
                { icon: Smartphone, label: "Device Management", desc: "Assign, track, and monitor devices across your entire organization." },
              ].map((item) => (
                <div key={item.label} className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <item.icon className="h-4 w-4 text-accent" />
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-accent" />
              Your Account
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email</span>
                </div>
                <span className="font-semibold text-foreground text-xs">{email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Role</span>
                </div>
                <span className="font-semibold text-foreground text-xs">{role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Status</span>
                </div>
                <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Pending Setup
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/account")}
              className="mt-4 w-full px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <User className="h-3.5 w-3.5" />
              Edit Account
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-accent" />
              Next Steps
            </h2>
            <ol className="space-y-3">
              {[
                "Complete your profile with your name and details.",
                "Ask your admin to assign you a role (caregiver or hospital admin).",
                "Once assigned, your dashboard will update automatically.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/account")}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-sm flex items-center gap-1.5"
        >
          <User className="h-3.5 w-3.5" />
          Edit Account
        </button>
        <button
          onClick={() => navigate("/account")}
          className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-all border border-border flex items-center gap-1.5"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          View Profile
        </button>
      </div>
    </div>
  );
}
