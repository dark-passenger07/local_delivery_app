import { Request, Response } from "express";
import { z } from "zod";
import { sendOtp, verifyOtp, resendOtp } from "../services/fast2sms.service.js";
import { db } from "../libs/db.js";
import type { OtpPurpose } from "@prisma/client";

// ---------------------------------------------------------------------------
// Shared validation helpers
// ---------------------------------------------------------------------------

const PhoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, {
    message:
      "Phone number must be a valid 10-digit Indian mobile number (starts with 6-9).",
  });

const OtpPurposeSchema = z.enum(["SIGNUP", "LOGIN", "CHANGE_PHONE"] as const);

const CodeSchema = z
  .string()
  .trim()
  .length(6, { message: "OTP must be exactly 6 digits." })
  .regex(/^\d{6}$/, { message: "OTP must contain only digits." });

// Login OTPs must only be sent to phones that already have an account.
async function userExists(phone: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { phone },
    select: { id: true },
  });
  return Boolean(user);
}

const USER_NOT_FOUND_MESSAGE =
  "No account found with this phone number. Please sign up first.";

// ---------------------------------------------------------------------------
// POST /otp/send
// Body: { phone, purpose }
//
// Sends a fresh 6-digit OTP to the given phone number. Deletes any existing
// unverified OTP for the same phone+purpose first. Does NOT require the user
// to be logged in — it is the gateway to login / signup.
// ---------------------------------------------------------------------------
export const sendOtpHandler = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      phone: PhoneSchema,
      purpose: OtpPurposeSchema,
    });

    const parsed = schema.safeParse(req.body);
    console.log("[OTP /send] body received:", JSON.stringify(req.body));
    console.log("[OTP /send] parse result:", parsed.success ? "OK" : JSON.stringify(parsed.error.flatten()));
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const { phone, purpose } = parsed.data;

    // For login, make sure the account exists before spending an SMS.
    if (purpose === "LOGIN" && !(await userExists(phone))) {
      return res.status(404).json({
        success: false,
        message: USER_NOT_FOUND_MESSAGE,
      });
    }

    await sendOtp(phone, purpose as OtpPurpose);

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${phone}. It is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
    });
  } catch (error: any) {
    console.error("Error in sendOtpHandler:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message ?? "Failed to send OTP. Please try again.",
    });
  }
};

// ---------------------------------------------------------------------------
// POST /otp/verify
// Body: { phone, code, purpose }
//
// Verifies the OTP. On success the caller can proceed with signup / login /
// phone-change — this endpoint only confirms the OTP itself, it does NOT
// issue a JWT. The auth flow (create user / issue cookie) remains in
// user.controllers.ts; this is called BEFORE those steps.
// ---------------------------------------------------------------------------
export const verifyOtpHandler = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      phone: PhoneSchema,
      code: CodeSchema,
      purpose: OtpPurposeSchema,
    });

    const parsed = schema.safeParse(req.body);
    console.log("[OTP /verify] body received:", JSON.stringify(req.body));
    console.log("[OTP /verify] parse result:", parsed.success ? "OK" : JSON.stringify(parsed.error.flatten()));
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const { phone, code, purpose } = parsed.data;

    await verifyOtp(phone, code, purpose as OtpPurpose);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      phone,
      purpose,
    });
  } catch (error: any) {
    console.error("Error in verifyOtpHandler:", error.message);
    // Return 400 only for known user-facing OTP errors (invalid / expired).
    // Anything else (DB down, Prisma error, etc.) is a 500.
    const knownMessages = [
      "Invalid OTP",
      "Your OTP has expired",
    ];
    const isUserError = knownMessages.some((m) => error.message?.startsWith(m));
    return res.status(isUserError ? 400 : 500).json({
      success: false,
      message: error.message ?? "OTP verification failed.",
    });
  }
};

// ---------------------------------------------------------------------------
// POST /otp/resend
// Body: { phone, purpose }
//
// Generates and sends a brand-new OTP, invalidating any previous unverified
// code for the same phone+purpose. Useful when "I didn't receive the code"
// or the first code expired.
// ---------------------------------------------------------------------------
export const resendOtpHandler = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      phone: PhoneSchema,
      purpose: OtpPurposeSchema,
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const { phone, purpose } = parsed.data;

    // Keep resend consistent with the initial login send.
    if (purpose === "LOGIN" && !(await userExists(phone))) {
      return res.status(404).json({
        success: false,
        message: USER_NOT_FOUND_MESSAGE,
      });
    }

    await resendOtp(phone, purpose as OtpPurpose);

    return res.status(200).json({
      success: true,
      message: `A new OTP has been sent to ${phone}. It is valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
    });
  } catch (error: any) {
    console.error("Error in resendOtpHandler:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message ?? "Failed to resend OTP. Please try again.",
    });
  }
};
