import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
// import { loginUser } from "../../api/auth.api";
import { useAuthStore } from "../../context/vendorContext/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { sendOtp } = useAuthStore()
  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Missing Number", "Please type your phone number to continue.");
      return;
    }

    // 1. Remove spaces, hyphens, brackets, and periods
    let normalizedNumber = phoneNumber.trim().replace(/[\s\-().]/g, "");

    // 2. Automatically strip "+91" or "91" if present at the start
    if (normalizedNumber.startsWith("+91")) {
      normalizedNumber = normalizedNumber.slice(3);
    } else if (normalizedNumber.startsWith("91") && normalizedNumber.length > 10) {
      normalizedNumber = normalizedNumber.slice(2);
    }

    // 3. Validate that it is exactly a 10-digit Indian phone number
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(normalizedNumber)) {
      Alert.alert("Check Your Number", "Please enter a correct 10-digit phone number.");
      return;
    }

    try {
      setLoading(true);
      // Ask backend to send an OTP via Fast2SMS
      await sendOtp(normalizedNumber, "LOGIN");

      Toast.show({
        type: "info",
        text1: "OTP Sent",
        text2: "Please type the code we sent you.",
        position: "top",
        visibilityTime: 2000,
      });

      navigation.navigate("OtpVerification", {
        phone: normalizedNumber,
        purpose: "LOGIN",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Could Not Send Code",
        text2: error.message || "Something went wrong. Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>👋</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your phone number to log in</Text>

        {/* Phone Number Input Field */}
        <Text style={styles.label}>Your Phone Number</Text>
        <View style={styles.inputRow}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="10-digit number"
            placeholderTextColor="#94A3B8"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!loading}
            maxLength={15}
          />
        </View>
        <Text style={styles.helperText}></Text>

        {/* Custom Login Button with Loader */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        {/* Professional Navigation Link */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => !loading && navigation.navigate("Signup")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>
            New here? <Text style={styles.linkHighlight}>Create an account</Text>
          </Text>
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
  formContainer: {
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
    fontSize: 28,
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
    marginBottom: 36,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    color: "#1E293B",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryCodeBox: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
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
  disabledButton: {
    backgroundColor: "#93C5FD",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  linkContainer: {
    marginTop: 28,
    alignItems: "center",
    paddingVertical: 10,
  },
  linkText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "600",
  },
  linkHighlight: {
    color: "#2563EB",
    fontWeight: "800",
  },
});