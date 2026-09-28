import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../context/vendorContext/AuthContext";

export default function SignupScreen({ navigation }: any) {
  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const { signup, sendOtp } = useAuthStore()


  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Missing Info", "Please enter your phone number.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Missing Info", "Please enter your address.");
      return;
    }

    // 1. Remove spaces, hyphens, brackets, and periods
    let normalizedNumber = phone.trim().replace(/[\s\-().]/g, "");

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

    // 4. Send OTP first
    try {
      setLoading(true);
      await sendOtp(normalizedNumber, "SIGNUP");

      Toast.show({
        type: "info",
        text1: "OTP Sent",
        text2: "Please type the code we sent you.",
        position: "top",
        visibilityTime: 2000,
      });

      navigation.navigate("OtpVerification", {
        phone: normalizedNumber,
        purpose: "SIGNUP",
        signupData: {
          name: name.trim(),
          phone: normalizedNumber,
          role: role,
          address: address.trim(),
        },
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📝</Text>
        </View>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>It only takes a minute</Text>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />

        {/* Phone Number */}
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputRow}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            placeholder="10-digit number"
            placeholderTextColor="#94A3B8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
            maxLength={15}
          />
        </View>

        {/* Address */}
        <Text style={styles.label}>Your Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="House number, street, village/town"
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          editable={!loading}
        />

        {/* Role Toggle Switch Component */}
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, role === "CUSTOMER" && styles.activeToggle]}
            onPress={() => setRole("CUSTOMER")}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.toggleIcon}>🛒</Text>
            <Text style={[styles.toggleText, role === "CUSTOMER" && styles.activeToggleText]}>
              Customer
            </Text>
            <Text style={[styles.toggleSubtext, role === "CUSTOMER" && styles.activeToggleSubtext]}>
              I want to receive services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, role === "VENDOR" && styles.activeToggle]}
            onPress={() => setRole("VENDOR")}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.toggleIcon}>🏪</Text>
            <Text style={[styles.toggleText, role === "VENDOR" && styles.activeToggleText]}>
              Vendor
            </Text>
            <Text style={[styles.toggleSubtext, role === "VENDOR" && styles.activeToggleSubtext]}>
              I want to sell services
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Continue →</Text>
          )}
        </TouchableOpacity>

        {/* Navigation Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => !loading && navigation.navigate("Login")}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkHighlight}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
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
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    color: "#1E293B",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryCodeBox: {
    borderWidth: 1.5,
    height: 55,
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
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    fontSize: 16,
    fontWeight: "500",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  inputFlex: {
    flex: 1,
  },
  textArea: {
    height: 84,
    textAlignVertical: "top",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
  },
  toggleIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#475569",
  },
  activeToggleText: {
    color: "#1D4ED8",
  },
  toggleSubtext: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 3,
    textAlign: "center",
  },
  activeToggleSubtext: {
    color: "#2563EB",
  },
  submitButton: {
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
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  linkButton: {
    marginTop: 22,
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