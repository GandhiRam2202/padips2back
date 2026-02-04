import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  dob: String,
  otp: String,
  otpExpires: Date,
  role: { type: String, default: "user" }, // Added role field
});

export default mongoose.model("User", userSchema);
