import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../context/vendorContext/AuthContext';
import { useVendorContextStore } from '../../context/vendorContext/VendorContext';
import { pickImage, type PickedImage } from '../../utils/pickImage';
import { useResponsive } from '../../utils/responsive';
import { COLORS, SHADOWS } from '../../theme/tokens';

const VendorSetUpScreen = () => {
  const { logout } = useAuthStore();
  const { vendorProfile, uploadVendorImage } = useVendorContextStore();
  const { width, isTablet, isSmallDevice, gutter, maxWidth, rf, ms } =
    useResponsive();

  const contentWidth = Math.min(maxWidth, width);
  void contentWidth;
  const titleFontSize = isSmallDevice ? rf(24) : rf(26);
  const subtitleFontSize = isSmallDevice ? rf(14) : rf(16);
  const previewHeight = isTablet ? 260 : 200;
  const buttonHeight = isSmallDevice ? ms(52) : ms(56);


  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageUri = pickedImage?.uri ?? null;

  const handlePickImage = async () => {
    if (isSubmitting) return;
    // pickImage handles its own permission / error alerts and returns null on
    // cancel or failure, so there's nothing to catch here.
    const img = await pickImage();
    if (img) setPickedImage(img);
  };

  const handleRemoveImage = () => {
    if (isSubmitting) return;
    setPickedImage(null);
  };

  const handleCreateProfile = async () => {
    // 1. Validation
    if (!businessName.trim()) {
      Alert.alert("Missing Info", "Please enter your shop or business name.");
      return;
    }
    if (!businessPhone.trim()) {
      Alert.alert("Missing Info", "Please enter your business phone number.");
      return;
    }

    if (businessPhone.trim().length < 8) {
      Alert.alert("Check Your Number", "Please enter a correct business phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      // 2. Submit to Zustand store
      // Your RootNavigator will automatically redirect when this succeeds
      await vendorProfile({
        businessName: businessName.trim(),
        businessPhone: businessPhone.trim()
      });

      // 3. The vendor profile now exists, so the image can be attached to it.
      // A failed upload must not undo the created shop — the vendor can always
      // add or change the photo later from the Profile screen.
      if (pickedImage) {
        try {
          await uploadVendorImage(pickedImage);
        } catch (imgError: any) {
          Alert.alert(
            "Photo not uploaded",
            imgError?.message ?? "Your shop was created, but the photo couldn't be uploaded. You can add it later from your profile."
          );
        }
      }
    } catch (error: any) {
      Alert.alert("Setup Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log Out?",
      "You will need to log in again to set up your shop.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: gutter,
            paddingVertical: ms(24),
            maxWidth: isTablet ? 720 : 520,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: titleFontSize }]}>Set Up Your Shop</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
              Add your shop photo and two details, and you're ready to start taking orders.
            </Text>
          </View>

          {/* Shop photo upload box */}
          <View style={styles.uploadSection}>
            <View style={styles.uploadLabelRow}>
              <Text style={[styles.uploadLabel, { fontSize: rf(15) }]}>Shop Photo</Text>
              <View style={styles.optionalChip}>
                <Text style={styles.optionalChipText}>OPTIONAL</Text>
              </View>
            </View>

            {imageUri ? (
              <View style={styles.previewWrap}>
                <Image
                  source={{ uri: imageUri }}
                  style={[styles.previewImage, { height: previewHeight }]}
                  resizeMode="cover"
                />
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={handlePickImage}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Change shop photo"
                  >
                    <Feather name="refresh-ccw" size={15} color={COLORS.primary} />
                    <Text style={styles.previewBtnText}>Change</Text>
                  </TouchableOpacity>
                  <View style={styles.previewActionDivider} />
                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={handleRemoveImage}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Remove shop photo"
                  >
                    <Feather name="trash-2" size={15} color="#DC2626" />
                    <Text style={[styles.previewBtnText, styles.previewRemoveText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadBox, { paddingVertical: ms(28), paddingHorizontal: ms(20) }]}
                onPress={handlePickImage}
                activeOpacity={0.7}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Upload shop photo"
              >
                <View style={styles.uploadIconCircle}>
                  <Feather name="image" size={26} color={COLORS.primary} />
                </View>
                <Text style={[styles.uploadBoxTitle, { fontSize: rf(16) }]}>Upload shop photo</Text>
                <Text style={[styles.uploadBoxHint, { fontSize: rf(13) }]}>Tap to choose a photo from your gallery</Text>
                <View style={styles.uploadCta}>
                  <Feather name="upload" size={14} color={COLORS.card} />
                  <Text style={[styles.uploadCtaText, { fontSize: rf(14) }]}>Choose image</Text>
                </View>
              </TouchableOpacity>
            )}

            <Text style={styles.uploadCaption}>
              You can add or change this anytime from your profile.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: rf(15) }]}>Shop / Business Name</Text>
              <TextInput
                style={[styles.input, { fontSize: rf(16), paddingHorizontal: ms(16), paddingVertical: ms(14) }]}
                placeholder="e.g. Sharma General Store"
                placeholderTextColor={COLORS.inkMuted}
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
              <Text style={styles.helperText}>This is the name customers will see</Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: rf(15) }]}>Business Phone Number</Text>
              <TextInput
                style={[styles.input, { fontSize: rf(16), paddingHorizontal: ms(16), paddingVertical: ms(14) }]}
                placeholder="e.g. 98765 43210"
                placeholderTextColor={COLORS.inkMuted}
                value={businessPhone}
                onChangeText={setBusinessPhone}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
              <Text style={styles.helperText}>Customers will call this number</Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.primaryButton, { height: buttonHeight }, isSubmitting && styles.buttonDisabled]}
              onPress={handleCreateProfile}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={[styles.primaryButtonText, { fontSize: rf(17) }]}>Finish Setup</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={confirmLogout}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { fontSize: rf(15) }]}>Log Out</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VendorSetUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  uploadSection: {
    width: '100%',
    marginBottom: 24,
  },
  uploadLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  uploadLabel: {
    fontWeight: '800',
    color: '#1E293B',
  },
  optionalChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  optionalChipText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#BFD3F5',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F5F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E7EEFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadBoxTitle: {
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  uploadBoxHint: {
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadCtaText: {
    color: COLORS.card,
    fontWeight: '800',
  },
  previewWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    ...SHADOWS.card,
  },
  previewImage: {
    width: '100%',
    backgroundColor: '#E7ECFB',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  previewRemoveText: {
    color: '#DC2626',
  },
  previewActionDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.border,
  },
  uploadCaption: {
    fontSize: 12.5,
    color: COLORS.inkMuted,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.inkSoft,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepBadgeText: {
    color: COLORS.card,
    fontSize: 14,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    fontWeight: '500',
    color: COLORS.ink,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.inkMuted,
    fontWeight: '600',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...SHADOWS.button,
  },
  buttonDisabled: {
    opacity: 1,
    backgroundColor: COLORS.primaryMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
