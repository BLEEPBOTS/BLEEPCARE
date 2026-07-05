import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Smartphone,
  Check,
  X,
  Key,
  AtSign,
  Fingerprint,
  Building2,
  HeartPulse,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-accent/10 text-accent",
  hospitalAdmin: "bg-blue-500/10 text-blue-500",
  careGiver: "bg-emerald-500/10 text-emerald-500",
  user: "bg-amber-500/10 text-amber-500",
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const role = user?.role ?? "user";
  const roleBadge = roleColors[role] ?? roleColors.user;

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await authClient.updateUser({ name, username, phone, gender: gender || undefined });
      toast.success("Profile updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeEmail() {
    if (!newEmail) return;
    setChangingEmail(true);
    try {
      await authClient.changeEmail({ newEmail, callbackURL: window.location.origin + "/account" });
      toast.success("Verification email sent to " + newEmail);
      setNewEmail("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to change email");
    } finally {
      setChangingEmail(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await authClient.changePassword({ currentPassword, newPassword });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    navigate("/login");
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-center">
        <div>
          <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Not authenticated</p>
          <button onClick={() => navigate("/login")} className="mt-3 text-xs text-accent hover:text-accent/80 font-medium">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-xl font-bold text-[hsl(var(--sidebar-primary-foreground))] shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{user.name ?? "User"}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className={roleBadge + " text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"}>{role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Profile Information" icon={User}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                  placeholder="@username"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground"
                >
                  <option value="">—</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Account Details" icon={Shield}>
          <div className="space-y-3">
            {[
              { icon: Fingerprint, label: "User Code", value: user.userCode ?? "—" },
              { icon: Mail, label: "Email", value: user.email ?? "—" },
              { icon: AtSign, label: "Username", value: user.username ?? "—" },
              { icon: Building2, label: "Hospital ID", value: user.hospitalId || "Not assigned" },
              { icon: Smartphone, label: "Device ID", value: user.deviceId || "Not assigned" },
              { icon: HeartPulse, label: "Patient ID", value: (user as any).patientId || "Not assigned" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-xs font-mono text-foreground">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Role</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${roleBadge}`}>{role}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Email Verified</span>
              </div>
              {user.emailVerified ? (
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="h-2.5 w-2.5" /> Verified
                </span>
              ) : (
                <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <X className="h-2.5 w-2.5" /> Unverified
                </span>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Change Email" icon={Mail}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              A verification email will be sent to the new address.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                placeholder="new@email.com"
              />
              <button
                onClick={handleChangeEmail}
                disabled={changingEmail || !newEmail}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                {changingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                {changingEmail ? "Sending..." : "Change"}
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Change Password" icon={Key}>
          <div className="space-y-4">
            <div className="space-y-3">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                placeholder="Current password"
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                placeholder="New password (min 8 characters)"
              />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground/50"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
            >
              {changingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="bg-card border border-destructive/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-destructive/10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-4 w-4 text-destructive" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Session</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
