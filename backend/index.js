import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import corsOptions from "./config/corsOptions.js";
import morgan from "morgan";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import { dbConnect } from "./utils/mongodb.js";

// route imports
import hospitalRoutes from "./routes/hospitalRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import deviceLogRoutes from "./routes/deviceLogRoutes.js";
import { dbMiddleware } from "./middleware/dbConnection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));

app.use(dbMiddleware);

app.use(morgan("tiny")); // logger

// routes
app.all("/api/auth/*splat", toNodeHandler(auth)); // better-auth
app.use("/api/patient", patientRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/device-logs", deviceLogRoutes);

app.use(async (req, res, next) => {
  const session = await auth.api.listUsers({
    headers: fromNodeHeaders(req.headers),
  });
  console.log("Session:", session);
  next();
});

app.all(/.*/, (req, res) => {
  res.status(404);
  if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// initialize cached MongoDB connection
dbConnect().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// MQTT ingestion — only when explicitly enabled (not on Vercel)
if (process.env.ENABLE_MQTT === "true") {
  import("./services/deviceLogIngestion.js");
}

// local development only
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
