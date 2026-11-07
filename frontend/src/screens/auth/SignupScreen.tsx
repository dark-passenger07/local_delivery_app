import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../context/vendorContext/AuthContext";
import { useResponsive } from "../../utils/responsive";
import { COLORS, SHADOWS } from "../../theme/tokens";

export default function SignupScreen({ navigation }: any) {
  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const { sendOtp } = useAuthStore();
  const { width, isTablet, isSmallDevice, gutter, maxWidth, rf, ms } =
    useResponsive();

  const contentWidth = Math.min(maxWidth, width);
  void contentWidth;
  const iconSize = isSmallDevice ? ms(64) : ms(76);
  const titleFontSize = isSmallDevice ? rf(24) : rf(28);
  const subtitleFontSize = isSmallDevice ? rf(14) : rf(16);
  const buttonHeight = isSmallDevice ? ms(52) : ms(56);

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
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: gutter,
            paddingVertical: ms(24),
            maxWidth: isTablet ? 720 : 520,
            width: "100%",
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.iconCircle,
              {
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize / 2,
              },
            ]}
          >
            <Text style={[styles.iconText, { fontSize: rf(32) }]}>📝</Text>
          </View>
          <Text style={[styles.title, { fontSize: titleFontSize }]}>
            Create Your Account
          </Text>
          <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
            It only takes a minute
          </Text>

          {/* Full Name */}
          <Text style={[styles.label, { fontSize: rf(15) }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { fontSize: rf(17), padding: ms(14) }]}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.inkMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* Phone Number */}
          <Text style={[styles.label, { fontSize: rf(15) }]}>Phone Number</Text>
          <View style={styles.inputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={[styles.countryCodeText, { fontSize: rf(15) }]}>
                +91
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.inputFlex,
                { fontSize: rf(17), padding: ms(14) },
              ]}
              placeholder="10-digit number"
              placeholderTextColor={COLORS.inkMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
              maxLength={15}
            />
          </View>

          {/* Address */}
          <Text style={[styles.label, { fontSize: rf(15) }]}>Your Address</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { fontSize: rf(17), padding: ms(14) },
            ]}
            placeholder="House number, street, village/town"
            placeholderTextColor={COLORS.inkMuted}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            editable={!loading}
          />

          {/* Role Toggle Switch Component */}
          <Text style={[styles.label, { fontSize: rf(15) }]}>I am a...</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { minHeight: ms(64) },
                role === "CUSTOMER" && styles.activeToggle,
              ]}
              onPress={() => setRole("CUSTOMER")}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={[styles.toggleIcon, { fontSize: rf(24) }]}>🛒</Text>
              <Text
                style={[
                  styles.toggleText,
                  { fontSize: rf(15) },
                  role === "CUSTOMER" && styles.activeToggleText,
                ]}
              >
                Customer
              </Text>
              <Text
                style={[
                  styles.toggleSubtext,
                  role === "CUSTOMER" && styles.activeToggleSubtext,
                ]}
              >
                I want to receive services
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                { minHeight: ms(64) },
                role === "VENDOR" && styles.activeToggle,
              ]}
              onPress={() => setRole("VENDOR")}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={[styles.toggleIcon, { fontSize: rf(24) }]}>🏪</Text>
              <Text
                style={[
                  styles.toggleText,
                  { fontSize: rf(15) },
                  role === "VENDOR" && styles.activeToggleText,
                ]}
              >
                Vendor
              </Text>
              <Text
                style={[
                  styles.toggleSubtext,
                  role === "VENDOR" && styles.activeToggleSubtext,
                ]}
              >
                I want to sell services
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { height: buttonHeight },
              loading && styles.disabledButton,
            ]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.submitButtonText, { fontSize: rf(17) }]}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Navigation Link */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => !loading && navigation.navigate("Login")}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, { fontSize: rf(15) }]}>
                Already have an account?
              </Text>
              <Text style={[styles.linkHighlight, { fontSize: rf(15) }]}>
                Log In
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  iconCircle: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  iconText: {
    fontWeight: "700",
  },
  title: {
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
    color: COLORS.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: "500",
    color: COLORS.inkSoft,
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
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
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    fontWeight: "700",
    color: COLORS.ink,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 18,
    fontWeight: "500",
    backgroundColor: COLORS.inputBg,
    color: COLORS.ink,
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
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  toggleButton: {
    flex: 1,
    flexBasis: 140,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: "#DBEAFE",
    borderColor: COLORS.primary,
  },
  toggleIcon: {
    marginBottom: 6,
  },
  toggleText: {
    fontWeight: "800",
    color: COLORS.inkSoft,
  },
  activeToggleText: {
    color: COLORS.primaryDark,
  },
  toggleSubtext: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.inkMuted,
    marginTop: 3,
    textAlign: "center",
    flexShrink: 1,
  },
  activeToggleSubtext: {
    color: COLORS.primary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.button,
  },
  disabledButton: {
    backgroundColor: COLORS.primaryMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  linkButton: {
    marginTop: 22,
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 4,
    rowGap: 2,
  },
  linkText: {
    color: COLORS.inkSoft,
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
  },
  linkHighlight: {
    color: COLORS.primary,
    fontWeight: "800",
  },
});
