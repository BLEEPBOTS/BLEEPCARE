import { dbConnect } from "../utils/mongodb.js";

const dbMiddleware = async (req, res, next) => {
  try {
    console.log("connecting");
    await dbConnect();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res
      .status(500)
      .json({ message: "Database connection error", isError: true });
  }
};

export { dbMiddleware };
