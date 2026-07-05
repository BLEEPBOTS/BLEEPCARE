import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, username } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { customAlphabet } from "nanoid";

const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const client = new MongoClient(process.env.MONGODB_URL);
const db = client.db();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.FRONTEND_URL],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  database: mongodbAdapter(db, {
    client,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [
    username(),
    admin({
      roles: {
        admin: adminAc,
        user: userAc,
        careGiver: userAc,
        hospitalAdmin: adminAc,
      },
      defaultRole: "user",
    }),
  ],
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
        unique: true,
      },
      gender: {
        type: ["m", "f"],
        required: false,
        input: true,
      },
      userCode: {
        type: "string",
        required: false,
        defaultValue: randomCode(),
        input: false,
      },
      deviceId: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      hospitalId: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      patientId: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
});
