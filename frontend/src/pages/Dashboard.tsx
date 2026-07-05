import NewUserDashboard from "@/components/roleDashboards/NewUserDashboard";
import useRole from "@/hooks/use-role";
import React from "react";
import HospitalDashboard from "@/components/roleDashboards/HospitalDashboard";
import CaregiverDashboard from "@/components/roleDashboards/CaregiverDashboard";
import AdminDashboard from "@/components/roleDashboards/AdminDashboard";

const Dashboard = () => {
  const role = useRole();
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "hospitalAdmin":
      return <HospitalDashboard />;
    case "careGiver":
      return <CaregiverDashboard />;
    default:
      return <NewUserDashboard />;
  }
};

export default Dashboard;
