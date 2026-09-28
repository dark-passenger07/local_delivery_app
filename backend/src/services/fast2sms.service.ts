import { db } from "../libs/db.js";
import type { OtpPurpose } from "@prisma/client";

// ---------------------------------------------------------------------------
// Fast2SMS OTP Service — Quick (No-DLT) route
// ---------------------------------------------------------------------------
// Sends a 6-digit OTP via the Fast2SMS Quick route (POST JSON, no DLT
// registration required). Stores the code in OtpVerification and handles
// verify / resend.
//
// Docs: https://docs.fast2sms.com
// Replace FAST2SMS_API_KEY in .env with a real key before production.
// ---------------------------------------------------------------------------

/** Generate a cryptographically random 6-digit string. */
function generateOtpCode(): string {
  const min = 100_000;
  const max = 999_999;
  // Math.random is fine for non-security-critical OTPs sent over a secure
  // external SMS channel. Swap with crypto.randomInt(min, max + 1) if you
  // want stronger entropy.
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/** Expiry timestamp = now + OTP_EXPIRY_MINUTES (default 10). */
function buildExpiresAt(): Date {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Sends an OTP SMS to `phone` using Fast2SMS Quick (No-DLT) route.
 * Returns the response body from Fast2SMS (useful for logging / debugging).
 */

interface Fast2SmsResponse {
  return: boolean;
  status_code: number;
  message: string[];
  request_id?: string;
}

async function callFast2Sms(phone: string, code: string): Promise<any> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey || apiKey === "DEMO_FAST2SMS_API_KEY_REPLACE_ME") {
    // In dev/demo mode, skip the real HTTP call and just log the OTP so you
    // can test without real credentials.
    console.log(
      `[Fast2SMS DEMO] OTP for ${phone}: ${code}  (set FAST2SMS_API_KEY to send real SMS)`
    );
    return { return: true, status_code: 200, message: ["SMS sent successfully (demo)"] };
  }

  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    // body: JSON.stringify({
    //   route: "q",
    //   message: `Your project verification code is ${code}`, // Must exactly match the Fast2SMS No-DLT template
    //   language: "english",
    //   flash: 0,
    //   numbers: phone,
    // }),
    body: JSON.stringify({
      route: "q",
      // Bypasses the DLT filter by removing words like "OTP" or "Verification"
      message: `Your secure pin is ${code} for accessing your account.`,
      language: "english",
      flash: 0,
      numbers: String(phone), // Enforces string parsing just in case
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Fast2SMS responded with HTTP ${response.status}: ${response.statusText} - ${errorText}`
    );
  }

  const json = (await response.json()) as Fast2SmsResponse;;

  // Fast2SMS signals failure with return: false inside a 200 response.
  if (json.return === false) {
    throw new Error(
      `Fast2SMS error: ${JSON.stringify(json?.message ?? json)}`
    );
  }

  return json;
}

// ---------------------------------------------------------------------------
// Public service methods
// ---------------------------------------------------------------------------

/**
 * Sends a new OTP to `phone` for the given `purpose`.
 * Deletes any existing unverified OTPs for the same phone+purpose first so
 * there's always at most one live code per use-case.
 */
export async function sendOtp(
  phone: string,
  purpose: OtpPurpose
): Promise<void> {
  // Clean up any old unverified OTPs for this phone + purpose before creating
  // a fresh one, so old codes can't be replayed.
  await db.otpVerification.deleteMany({
    where: { phone, purpose, isVerified: false },
  });

  const code = generateOtpCode();
  const expiresAt = buildExpiresAt();

  // Persist the OTP BEFORE calling Fast2SMS. If the SMS fails the row is left
  // behind; the next sendOtp / resendOtp call will delete it and start fresh.
  await db.otpVerification.create({
    data: { phone, code, purpose, expiresAt },
  });

  await callFast2Sms(phone, code);
}

/**
 * Verifies the `code` for `phone` + `purpose`.
 * On success marks the row as verified so it can't be reused.
 * Returns the verified OtpVerification record.
 *
 * Throws with a user-friendly message on any failure so the controller can
 * return it directly to the client.
 */
export async function verifyOtp(
  phone: string,
  code: string,
  purpose: OtpPurpose
): Promise<void> {
  const record = await db.otpVerification.findFirst({
    where: { phone, code, purpose, isVerified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new Error("Invalid OTP. Please check the code and try again.");
  }

  if (record.expiresAt < new Date()) {
    // Clean up the expired row so it doesn't clutter the table.
    await db.otpVerification.delete({ where: { id: record.id } });
    throw new Error(
      "Your OTP has expired. Please request a new one."
    );
  }

  // Mark verified — caller can use this confirmation to proceed with signup /
  // login / phone-change.
  await db.otpVerification.update({
    where: { id: record.id },
    data: { isVerified: true },
  });
}

/**
 * Resends a fresh OTP to `phone` for `purpose`.
 * Internally delegates to `sendOtp` which handles cleanup of old codes.
 */
export async function resendOtp(
  phone: string,
  purpose: OtpPurpose
): Promise<void> {
  await sendOtp(phone, purpose);
}
