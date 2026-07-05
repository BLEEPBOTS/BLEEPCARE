import { authClient } from "@/lib/auth-client";
import React from "react";

const useRole = () => {
  const { data } = authClient.useSession();
  return data?.user?.role || "user";
};

export default useRole;
