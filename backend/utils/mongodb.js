import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(
      process.env.ENV == "dev"
        ? process.env.MONGODB_URL
        : process.env.MONGODB_URL,
      opts,
    );
    console.log("reconnecting to database...");
  }
  cached.conn = await cached.promise;
  return cached.conn;
};
export { dbConnect };
