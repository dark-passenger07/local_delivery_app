import express from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  resendOtpHandler,
} from "../controllers/otp.controllers.js";

const otpRouter = express.Router();

// POST /otp/send   — send a fresh OTP to a phone number
otpRouter.post("/send", sendOtpHandler);

// POST /otp/verify — verify the code the user entered
otpRouter.post("/verify", verifyOtpHandler);

// POST /otp/resend — invalidate old code and send a new one
otpRouter.post("/resend", resendOtpHandler);

export default otpRouter;
