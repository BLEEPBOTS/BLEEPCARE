import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import logoSrc from "@/assets/bleepbots-logo.png";
import { authClient } from "@/lib/auth-client";
import SideBarOptions from "./SideBarOptions";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const logout = async () => {
    const res = await authClient.signOut();
    navigate("/login");
    console.log(res);
  };

  const { data } = authClient.useSession();
  const { user: account } = data || {};
  // const { data: alertList } = useAlerts();
  // const unacked = (alertList || []).filter((a) => !a.acknowledged).length;

  const userName = account?.name ?? "User";
  const userRole = account?.role ?? "N/A";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border px-5 py-1">
        <img
          src={logoSrc}
          alt="BleepBots"
          className="h-24 w-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent>
        <SideBarOptions />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          to="/account"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-primary-foreground truncate leading-tight">
              {userName}
            </p>
            <p className="text-[11px] text-sidebar-foreground opacity-50 truncate">
              {userRole}
            </p>
          </div>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground opacity-60 hover:opacity-90 hover:bg-sidebar-accent transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </SidebarFooter>
    </>
  );
}
