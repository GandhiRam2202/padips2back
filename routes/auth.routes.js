import express from "express";
import apiKey from "../middleware/apiKey.js";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendFeedback,
  getTestList,
  getQuestionsByTest,
  submitTest,
  checkAttempt,
  
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", apiKey, register);
router.post("/login", apiKey, login);
router.post("/forgot-password", apiKey, forgotPassword);
router.post("/reset-password", apiKey, resetPassword);

router.get("/tests", getTestList);

// 2. Used by LearnQuestionsScreen: sending { test: item }
router.post("/tests/questions", apiKey, getQuestionsByTest);


router.post("/tests/check-attempt", apiKey, checkAttempt);

// Matches: api.post("/tests/submit")
router.post("/tests/submit", apiKey, submitTest);

router.post("/feedback", apiKey, sendFeedback);


export default router;
