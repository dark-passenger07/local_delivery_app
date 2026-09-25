import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../context/vendorContext/AuthContext';
import { useVendorContextStore } from '../../context/vendorContext/VendorContext';
import { pickImage, type PickedImage } from '../../utils/pickImage';

const COLORS = {
  background: '#FFFFFF',
  page: '#FAFAF8',
  surface: '#FAFAF8',
  surfaceAlt: '#F1EFE8',
  border: '#EDEBE3',
  primary: '#2F6FED',
  primarySurface: '#E6F1FB',
  primaryText: '#0C447C',
  danger: '#A32D2D',
  dangerSurface: '#FCEBEB',
  textPrimary: '#1A1A18',
  textSecondary: '#5F5E5A',
  textTertiary: '#9A9990',
}

const ProfileScreen = () => {
  const { logout } = useAuthStore();
  const insets = useSafeAreaInsets();
  // Destructure vendorAccount from your store
  const { vendorProfileDetails, updateVendorProfile, uploadVendorImage } = useVendorContextStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Extract vendorProfile based on your exact API response structure
  const profile = vendorProfileDetails;

  // Get first letter of business name or default to 'V'
  const avatarLetter = profile?.businessName?.charAt(0).toUpperCase() || 'V';

  // --- Edit profile state ---
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);

  // Preview inside the modal: newly picked image wins, else the saved image.
  const previewUri = pickedImage?.uri ?? profile?.image ?? null;

  const openEdit = () => {
    setName(profile?.user?.name ?? '');
    setAddress(profile?.user?.address ?? '');
    setBusinessName(profile?.businessName ?? '');
    setBusinessPhone(profile?.businessPhone ?? '');
    setPickedImage(null);
    setEditVisible(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditVisible(false);
    setPickedImage(null);
  };

  const handlePickImage = async () => {
    try {
      const img = await pickImage();
      if (img) setPickedImage(img);
    } catch (error: any) {
      Alert.alert('Could not open gallery', error?.message ?? 'Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    const n = name.trim();
    const a = address.trim();
    const bn = businessName.trim();
    const bp = businessPhone.trim();

    if (n.length < 2) {
      Alert.alert('Check name', 'Owner name must be at least 2 characters.');
      return;
    }
    if (a.length < 2) {
      Alert.alert('Check address', 'Address must be at least 2 characters.');
      return;
    }
    if (bn.length < 2) {
      Alert.alert('Check business name', 'Business name must be at least 2 characters.');
      return;
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(bp)) {
      Alert.alert('Check phone', 'Enter a valid business phone number (digits only, e.g. 9876543210).');
      return;
    }

    try {
      setSaving(true);
      await updateVendorProfile({ name: n, address: a, businessName: bn, businessPhone: bp });
      if (pickedImage) {
        await uploadVendorImage(pickedImage);
      }
      setEditVisible(false);
      setPickedImage(null);
    } catch (error: any) {
      Alert.alert('Update failed', error?.message ?? 'Could not update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Two-step confirmation: a mistaken tap should never log someone out.
  // The first dialog checks intent, the second is the final confirmation.
  const handleLogoutPress = () => {
    Alert.alert(
      'Log out?',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm log out',
              'This will sign you out. Do you want to continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, log out',
                  style: 'destructive',
                  onPress: async () => await logout(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.page} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Avatar Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={openEdit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
          >
            {profile?.image ? (
              <Image source={{ uri: profile.image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            )}
            <View style={styles.avatarCameraBadge}>
              <Feather name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.businessName}>{profile?.businessName || 'Business name'}</Text>
          <Text style={styles.ownerName}>Managed by {profile?.user?.name || 'Owner'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{profile?.user?.role || 'VENDOR'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={openEdit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Feather name="edit-2" size={14} color={COLORS.primaryText} />
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Business Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="phone" size={15} color={COLORS.primaryText} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Business phone</Text>
              <Text style={styles.infoValue}>{profile?.businessPhone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="briefcase" size={15} color={COLORS.primaryText} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Business name</Text>
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                {profile?.businessName || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Owner details</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="smartphone" size={15} color={COLORS.primaryText} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Personal phone</Text>
              <Text style={styles.infoValue}>{profile?.user?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="map-pin" size={15} color={COLORS.primaryText} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{profile?.user?.address || 'Not provided'}</Text>
            </View>
          </View>
        </View>

        {/* Total Revenue entry */}
        <TouchableOpacity
          style={styles.revenueRow}
          onPress={() => navigation.navigate('TotalRevenue')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="View total revenue"
        >
          <View style={styles.revenueIcon}>
            <Feather name="trending-up" size={18} color={COLORS.primaryText} />
          </View>
          <View style={styles.revenueTextWrap}>
            <Text style={styles.revenueTitle}>Total Revenue</Text>
            <Text style={styles.revenueSubtitle}>Earnings from every customer subscription</Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Feather name="log-out" size={18} color={COLORS.danger} />
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
            <View style={styles.modalHandle} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={[styles.modalScrollContent, { flexGrow: 1 }]}
            >
              <Text style={styles.modalTitle}>Edit profile</Text>

              {/* Photo picker */}
              <View style={styles.modalPhotoRow}>
                <TouchableOpacity
                  style={styles.modalAvatar}
                  onPress={handlePickImage}
                  activeOpacity={0.85}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Change profile photo"
                >
                  {previewUri ? (
                    <Image source={{ uri: previewUri }} style={styles.modalAvatarImage} />
                  ) : (
                    <Text style={styles.modalAvatarText}>{avatarLetter}</Text>
                  )}
                  <View style={styles.avatarCameraBadge}>
                    <Feather name="camera" size={13} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickImage} disabled={saving} activeOpacity={0.7}>
                  <Text style={styles.modalChangePhotoText}>
                    {previewUri ? 'Change shop photo' : 'Add shop photo'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Owner name</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                editable={!saving}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={styles.modalLabel}>Business name</Text>
              <TextInput
                style={styles.modalInput}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Your shop / business name"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="words"
                editable={!saving}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={styles.modalLabel}>Business phone</Text>
              <TextInput
                style={styles.modalInput}
                value={businessPhone}
                onChangeText={setBusinessPhone}
                placeholder="e.g. 9876543210"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="phone-pad"
                editable={!saving}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={styles.modalLabel}>Address</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                value={address}
                onChangeText={setAddress}
                placeholder="Your address"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="sentences"
                multiline
                editable={!saving}
                returnKeyType="done"
                blurOnSubmit
              />

              <Text style={styles.modalHint}>
                Your login phone number can't be changed here.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={closeEdit}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton, saving && styles.modalSaveDisabled]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.page,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 28,
  },
  avatarContainer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  ownerName: {
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  revenueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueTextWrap: {
    flex: 1,
    gap: 2,
  },
  revenueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  revenueSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerSurface,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.page,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  editProfileText: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  // --- Edit modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 18,
  },
  modalPhotoRow: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  modalAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.surfaceAlt,
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  modalChangePhotoText: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 16,
  },
  modalInputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalHint: {
    fontSize: 12.5,
    color: COLORS.textTertiary,
    fontWeight: '500',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.surfaceAlt,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  modalSaveDisabled: {
    backgroundColor: '#93C5FD',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});