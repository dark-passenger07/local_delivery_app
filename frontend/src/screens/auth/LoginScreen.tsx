import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
// import { loginUser } from "../../api/auth.api";
import { useAuthStore } from "../../context/vendorContext/AuthContext";
import { useResponsive } from "../../utils/responsive";
import { COLORS, SHADOWS } from "../../theme/tokens";

export default function LoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { sendOtp } = useAuthStore();
  const { width, isTablet, isSmallDevice, gutter, maxWidth, rf, ms } =
    useResponsive();

  // Responsive metrics (referenced to keep hook values live on rotation)
  const contentWidth = Math.min(maxWidth, width);
  void contentWidth;
  const iconSize = isSmallDevice ? ms(64) : ms(76);
  const iconFontSize = rf(32);
  const titleFontSize = isSmallDevice ? rf(24) : rf(28);
  const subtitleFontSize = isSmallDevice ? rf(14) : rf(16);
  const buttonHeight = isSmallDevice ? ms(52) : ms(56);
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
          <View style={styles.formInner}>
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
              <Text style={[styles.iconText, { fontSize: iconFontSize }]}>👋</Text>
            </View>

            <Text style={[styles.title, { fontSize: titleFontSize }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
              Enter your phone number to log in
            </Text>

            {/* Phone Number Input Field */}
            <Text style={[styles.label, { fontSize: rf(15) }]}>
              Your Phone Number
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.countryCodeBox}>
                <Text style={[styles.countryCodeText, { fontSize: rf(15) }]}>
                  +91
                </Text>
              </View>
              <TextInput
                style={[styles.input, { fontSize: rf(17), padding: ms(14) }]}
                placeholder="10-digit number"
                placeholderTextColor={COLORS.inkMuted}
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
              style={[
                styles.primaryButton,
                { height: buttonHeight },
                loading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { fontSize: rf(17) }]}>
                  Log In
                </Text>
              )}
            </TouchableOpacity>

            {/* Professional Navigation Link */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => !loading && navigation.navigate("Signup")}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.linkRow}>
                <Text style={[styles.linkText, { fontSize: rf(15) }]}>
                  New here?
                </Text>
                <Text style={[styles.linkHighlight, { fontSize: rf(15) }]}>
                  Create an account
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
  formInner: {
    width: "100%",
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
    marginBottom: 36,
  },
  label: {
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
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    fontWeight: "600",
    backgroundColor: COLORS.inputBg,
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.inkMuted,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
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
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
  linkContainer: {
    marginTop: 28,
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
