import { authClient } from "@/lib/auth-client";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RequireAuth = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, error, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (data?.session) {
        const isExpired =
          new Date(data.session.expiresAt).getTime() < Date.now();
        if (isExpired) {
          navigate("/login");
        } else {
          if (location.pathname == "/login") {
            navigate("/");
          }
        }
      } else if (error) {
        toast(error.message || "there was a problem");
        navigate("/login");
      } else {
        toast("No active session");
        if (location.pathname !== "/login")
          navigate("/login", { replace: true });
      }
    }
  }, [data, error, isPending]);

  if (isPending) {
    return <LoadingScreen />;
  }
  return <>{children}</>;
};

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]" />
    </div>
  );
}

export default RequireAuth;
