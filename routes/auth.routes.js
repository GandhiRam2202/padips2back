import express from "express";
import apiKey from "../middleware/apiKey.js";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", apiKey, register);
router.post("/login", apiKey, login);
router.post("/forgot-password", apiKey, forgotPassword);
router.post("/reset-password", apiKey, resetPassword);

export default router;
