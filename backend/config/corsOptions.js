import allowedOrigins from "./allowedOrigins.js";
const corsOptions = {
  origin: (origin, callBack) => {
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      !origin ||
      process.env.ENVIRONMENT === "dev"
    ) {
      callBack(null, true);
    } else {
      callBack(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
  optionsSuccessStatus: 200,
};

export default corsOptions;
