import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore, type OtpPurpose } from "../../context/vendorContext/AuthContext";

// The OTP screen is reused for both login and signup. The calling screen
// passes the phone, purpose (LOGIN or SIGNUP), and an onVerified callback via
// route params. After the user enters the correct OTP this screen calls
// onVerified back, and the original screen completes the auth flow.
interface OtpRouteParams {
  phone: string;
  purpose: OtpPurpose;
  // Signup-specific data carried forward for the signup call after OTP verification.
  signupData?: {
    name: string;
    phone: string;
    role: string;
    address: string;
  };
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function OtpVerificationScreen({ route, navigation }: any) {
  const { phone, purpose, signupData } = route.params as OtpRouteParams;
  const { verifyOtp, resendOtp, login, signup } = useAuthStore();

  // Each digit gets its own controlled input backed by a single hidden TextInput
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRef = useRef<TextInput>(null);

  // Countdown timer for the "Resend" button
  useEffect(() => {
    if (countdown <= 0) return;
    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [countdown]);

  // Focus the hidden input on mount so the keyboard opens immediately
  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleVerify = useCallback(async () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert("Incomplete code", "Please enter the full 6-digit OTP.");
      return;
    }
    setVerifying(true);
    try {
      await verifyOtp(phone, code, purpose);

      // After OTP is verified, complete the auth flow
      if (purpose === "LOGIN") {
        const res = await login({ phone });
        Toast.show({
          type: "success",
          text1: "Welcome! You're logged in",
          position: "top",
          visibilityTime: 2200,
        });
      } else if (purpose === "SIGNUP" && signupData) {
        const res = await signup(signupData);
        Toast.show({
          type: "success",
          text1: "Account Created!",
          position: "top",
          visibilityTime: 2200,
        });
      }
      // Navigation happens automatically via the RootNavigator (user state
      // becomes non-null → switches from AuthNavigator to the app).
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.message || "Something went wrong. Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setVerifying(false);
    }
  }, [code, phone, purpose, signupData, verifyOtp, login, signup]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await resendOtp(phone, purpose);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setCode("");
      Toast.show({
        type: "success",
        text1: "OTP Resent",
        text2: "A new code has been sent to your phone.",
        position: "top",
        visibilityTime: 2500,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could Not Resend",
        text2: error.message || "Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setResending(false);
    }
  }, [phone, purpose, resendOtp]);

  // Render OTP character boxes visually
  const digits = code.split("");

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔐</Text>
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.phoneHighlight}>+91 {phone}</Text>
        </Text>

        {/* Hidden input that captures the keyboard */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(text) => {
            // Only allow digits, max 6
            const cleaned = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
            setCode(cleaned);
          }}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus
          style={styles.hiddenInput}
          editable={!verifying}
        />

        {/* OTP digit boxes */}
        <TouchableOpacity
          style={styles.otpRow}
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const isFocused = i === digits.length && code.length < OTP_LENGTH;
            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  isFocused && styles.otpBoxFocused,
                  digits[i] != null && styles.otpBoxFilled,
                ]}
              >
                <Text style={styles.otpDigit}>{digits[i] || ""}</Text>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Verify button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (verifying || code.length < OTP_LENGTH) && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={verifying || code.length < OTP_LENGTH}
          activeOpacity={0.85}
        >
          {verifying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code?</Text>
          {countdown > 0 ? (
            <Text style={styles.resendCountdown}>
              Resend in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
              {resending ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.resendLink}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Go back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={verifying}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Change phone number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E7ECFB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  iconText: {
    fontSize: 34,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  phoneHighlight: {
    fontWeight: "800",
    color: "#0F172A",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 32,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  otpBoxFilled: {
    borderColor: "#2563EB",
    backgroundColor: "#DBEAFE",
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  verifyButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyButtonDisabled: {
    backgroundColor: "#93C5FD",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  resendLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  resendCountdown: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
});
