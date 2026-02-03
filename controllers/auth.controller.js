import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtp } from "../utils/sendOtp.js";
import emailjs from "@emailjs/nodejs";
import testmodel from "../models/Testmodel.js"


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









export const getTestList = async (req, res) => {
  try {
    // This finds every unique "test" number in your database (e.g., [1, 2, 5])
    const tests = await testmodel.distinct("test");

    // Sort them so they appear as Test 1, Test 2, Test 3...
    const sortedTests = tests.sort((a, b) => a - b);

    res.status(200).json({
      success: true,
      data: sortedTests // Your FlatList expects an array like [1, 2, 3]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load tests" });
  }
};


/* ======================================================
   2. LEARN SCREEN: Fetch Questions for the Selected Test
   ====================================================== */
export const getQuestionsByTest = async (req, res) => {
  try {
    const { test } = req.body; // Sent from LearnQuestionsScreen

    const questions = await testmodel.find({ test: Number(test) })
      .sort({ questionNo: 1 });

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error loading questions" });
  }
};






// --- FEEDBACK SCREEN ---
export const sendFeedback = async (req, res) => {
  const { name, email, feedback } = req.body;

  
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_FEEDBACK_TEMPLATE_ID,
      { from_name: name, from_email: email, feedback: feedback },
      { publicKey: process.env.EMAILJS_PUBLIC_KEY, privateKey: process.env.EMAILJS_PRIVATE_KEY }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
};
