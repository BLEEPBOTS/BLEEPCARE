import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="overflow-y-auto">
        <div className="md:hidden flex items-center gap-2 border-b border-border bg-background px-4 py-2 sticky top-0 z-10">
          <SidebarTrigger />
          <span className="font-semibold text-sm">BleepCare</span>
        </div>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
