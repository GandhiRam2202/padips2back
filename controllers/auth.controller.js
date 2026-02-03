import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtp } from "../utils/sendOtp.js";
import emailjs from "@emailjs/nodejs";


/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      dob,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        dob: user.dob,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendOtp(email, otp);

    res.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};



/* ================= FEEDBACK EMAIL (EMAILJS) ================= */

export const sendFeedbackEmail = async (req, res) => {
  const { name, email, feedback } = req.body;
  
  if (!name || !email || !feedback) {
    return res.status(400).json({ success: false, msg: "Missing fields" });
  }
  
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID_2,
      {
        from_name: name,
        from_email: email,
        message: feedback,
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    
    return res.status(200).json({ success: true, msg: "Feedback email sent successfully", response });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Email sending failed", error: error?.text || error });
  }
};



// --- HOME SCREEN: Fetch Test Numbers ---
export const getTests = async (req, res) => {
  try {
    // Returns unique test numbers found in the Questions collection
    const tests = await Question.distinct("test");
    res.json({ success: true, data: tests });
  } catch (err) { res.status(500).json({ success: false }); }
};




// --- LEARN QUESTIONS SCREEN ---
export const getQuestionsByTest = async (req, res) => {
  try {
    const { test } = req.body;
    const questions = await Question.find({ test }).sort({ questionNo: 1 });
    res.json({ success: true, data: questions });
  } catch (err) { res.status(500).json({ success: false }); }
};

// --- LEADERBOARD SCREEN ---
export const getLeaderboard = async (req, res) => {
  try {
    // Aggregates user scores, counting tests and calculating averages
    const leaderboard = await TestResult.aggregate([
      {
        $group: {
          _id: "$email",
          name: { $first: "$name" },
          totalScore: { $sum: "$score" },
          tests: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 20 }
    ]);
    res.json({ success: true, data: leaderboard });
  } catch (err) { res.status(500).json({ success: false }); }
};

// --- PROFILE SCREEN: Load Scores ---
export const getProfileScores = async (req, res) => {
  try {
    const { email } = req.body;
    const results = await TestResult.find({ email }).sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (err) { res.status(500).json({ success: false }); }
};

// --- FEEDBACK SCREEN ---
export const sendFeedback = async (req, res) => {
  const { name, email, feedback } = req.body;
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      { from_name: name, from_email: email, message: feedback },
      { publicKey: process.env.EMAILJS_PUBLIC_KEY, privateKey: process.env.EMAILJS_PRIVATE_KEY }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
};

// --- ADMIN: Force Logout (For Socket.io) ---
export const restrictUser = async (req, res) => {
  const { userId, type, reason } = req.body; // type: 'blocked' or 'suspended'
  const io = req.app.get('socketio');
  
  // Emit to the user's specific room
  io.to(userId).emit("forceLogout", { type, reason });
  
  res.json({ success: true, message: "User notified and logged out" });
};