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

const VendorSetUpScreen = () => {
  const { logout } = useAuthStore();
  const { vendorProfile, uploadVendorImage } = useVendorContextStore();


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
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Up Your Shop</Text>
            <Text style={styles.subtitle}>
              Add your shop photo and two details, and you're ready to start taking orders.
            </Text>
          </View>

          {/* Shop photo upload box */}
          <View style={styles.uploadSection}>
            <View style={styles.uploadLabelRow}>
              <Text style={styles.uploadLabel}>Shop Photo</Text>
              <View style={styles.optionalChip}>
                <Text style={styles.optionalChipText}>OPTIONAL</Text>
              </View>
            </View>

            {imageUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={handlePickImage}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Change shop photo"
                  >
                    <Feather name="refresh-ccw" size={15} color="#2563EB" />
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
                style={styles.uploadBox}
                onPress={handlePickImage}
                activeOpacity={0.7}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Upload shop photo"
              >
                <View style={styles.uploadIconCircle}>
                  <Feather name="image" size={26} color="#2563EB" />
                </View>
                <Text style={styles.uploadBoxTitle}>Upload shop photo</Text>
                <Text style={styles.uploadBoxHint}>Tap to choose a photo from your gallery</Text>
                <View style={styles.uploadCta}>
                  <Feather name="upload" size={14} color="#FFFFFF" />
                  <Text style={styles.uploadCtaText}>Choose image</Text>
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
              <Text style={styles.label}>Shop / Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sharma General Store"
                placeholderTextColor="#94A3B8"
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
              <Text style={styles.label}>Business Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 98765 43210"
                placeholderTextColor="#94A3B8"
                value={businessPhone}
                onChangeText={setBusinessPhone}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
              <Text style={styles.helperText}>Customers will call this number</Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleCreateProfile}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Finish Setup</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={confirmLogout}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Log Out</Text>
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
    backgroundColor: '#F4F6FB',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
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
    fontSize: 16,
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
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#BFD3F5',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#F5F8FF',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  uploadBoxHint: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  previewWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E7ECFB',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#2563EB',
  },
  previewRemoveText: {
    color: '#DC2626',
  },
  previewActionDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#E2E8F0',
  },
  uploadCaption: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
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
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  helperText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 56,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 1,
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
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
    fontSize: 15,
    fontWeight: '700',
  },
});