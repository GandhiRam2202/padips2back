import express from "express";
import apiKey from "../middleware/apiKey.js";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendFeedbackEmail,
  getTests,
  getQuestionsByTest,
  getLeaderboard,
  getProfileScores,
  sendFeedback,
  restrictUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", apiKey, register);
router.post("/login", apiKey, login);
router.post("/forgot-password", apiKey, forgotPassword);
router.post("/reset-password", apiKey, resetPassword);

router.get("/tests", getTests);
router.post("/tests/questions", getQuestionsByTest);
router.get("/tests/leaderboard", getLeaderboard);
router.post("/tests/profile", getProfileScores);
router.post("/feedback", sendFeedback);
router.post("/admin/restrict", restrictUser);

export default router;
