import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    emailVerified: Boolean,
    image: String,
    username: String,
    role: String,
    phone: String,
    gender: String,
    userCode: String,
    deviceId: String,
    hospitalId: String,
    patientId: String,
  },
  {
    collection: "users",
    timestamps: true,
  },
);

const User = mongoose.model("User", UserSchema);
export default User;
