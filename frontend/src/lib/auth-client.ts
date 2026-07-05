import {
  adminClient,
  inferAdditionalFields,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        phone: {
          type: "string",
        },
        gender: {
          type: ["m", "f"],
        },
        userCode: {
          type: "string",
        },
        deviceId: {
          type: "string",
        },
        hospitalId: {
          type: "string",
        },
      },
    }),
    adminClient(),
    usernameClient(),
  ],
});
