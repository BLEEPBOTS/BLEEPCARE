import React from "react";
import useRole from "@/hooks/use-role";
import { authClient } from "@/lib/auth-client";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Bell,
  Smartphone,
  ClipboardList,
  Building2,
  PlusCircle,
  Cpu,
  Stethoscope,
  UserPlus,
  Users,
  User,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  const location = useLocation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={location.pathname === to} tooltip={label}>
        <Link to={to}>
          <Icon className="h-4 w-4 shrink-0" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

const SideBarOptions = () => {
  const role = useRole();
  const { data: session } = authClient.useSession();
  const hospitalId = session?.user?.hospitalId;

  switch (role) {
    case "careGiver":
      return (
        <SidebarMenu>
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/device-logs" icon={Bell} label="Alerts" />
          <NavItem to="/device-info" icon={Smartphone} label="Device Info" />
          <NavItem to="/logs" icon={ClipboardList} label="All Logs" />
        </SidebarMenu>
      );
    case "admin":
      return (
        <SidebarMenu>
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/hospitals" icon={Building2} label="All hospitals" />
          <NavItem to="/hospitals/create" icon={PlusCircle} label="Create Hospital" />
          <NavItem to="/devices" icon={Cpu} label="All devices" />
          <NavItem to="/devices/create" icon={PlusCircle} label="Create Device" />
        </SidebarMenu>
      );
    case "hospitalAdmin":
      if (!hospitalId) return null;
      return (
        <SidebarMenu>
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to={`/hospitals/${hospitalId}/caregivers`} icon={Stethoscope} label="All care givers" />
          <NavItem to={`/hospitals/${hospitalId}/caregivers/add`} icon={UserPlus} label="Add care giver" />
          <NavItem to="/patients" icon={Users} label="All patients" />
          <NavItem to="/patients/add" icon={UserPlus} label="Add patient" />
          <NavItem to={`/hospitals/${hospitalId}/devices`} icon={Smartphone} label="All devices" />
          <NavItem to={`/hospitals/${hospitalId}/alerts`} icon={Bell} label="Alerts" />
        </SidebarMenu>
      );
    default:
      return (
        <SidebarMenu>
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/account" icon={User} label="Account" />
        </SidebarMenu>
      );
  }
};

export default SideBarOptions;
