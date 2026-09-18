import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../context/vendorContext/AuthContext';

const ProfileScreen = () => {
  const { logout, user, authUser, updateProfile } = useAuthStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // --- Edit profile state ---
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        await authUser();
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to load your profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await authUser();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to refresh your profile');
    } finally {
      setRefreshing(false);
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const openEdit = () => {
    setName(user?.name ?? '');
    setAddress(user?.address ?? '');
    setEditVisible(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditVisible(false);
  };

  const handleSaveProfile = async () => {
    const n = name.trim();
    const a = address.trim();

    if (n.length < 2) {
      Alert.alert('Check name', 'Your name must be at least 2 characters.');
      return;
    }
    if (a.length < 2) {
      Alert.alert('Check address', 'Your address must be at least 2 characters.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({ name: n, address: a });
      setEditVisible(false);
    } catch (error: any) {
      Alert.alert('Update failed', error?.message ?? 'Could not update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to log out. Please try again.');
          } finally {
            setLoggingOut(false);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading your profile…</Text>
      </SafeAreaView>
    );
  }

  const infoRows: { icon: string; label: string; value?: string }[] = [
    { icon: '👤', label: 'Role', value: user?.role },
    { icon: '📞', label: 'Phone', value: user?.phone },
    { icon: '📍', label: 'Address', value: user?.address }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" colors={['#6366F1']} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEdit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Feather name="edit-2" size={14} color="#6366F1" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Unnamed User'}</Text>
          {user?.role ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user.role}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.infoCard}>
          {infoRows.map((row, index) => (
            <View
              key={row.label}
              style={[styles.infoRow, index === infoRows.length - 1 && styles.infoRowLast]}
            >
              <View style={styles.infoIconCircle}>
                <Text style={styles.infoIconText}>{row.icon}</Text>
              </View>
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value || 'Not provided'}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalTitle}>Edit profile</Text>

              <Text style={styles.modalLabel}>Name</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                editable={!saving}
              />

              <Text style={styles.modalLabel}>Address</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                value={address}
                onChangeText={setAddress}
                placeholder="Your delivery address"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="sentences"
                multiline
                editable={!saving}
              />

              <Text style={styles.modalHint}>
                Your phone number can't be changed here.
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F6FA' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14, fontWeight: '500' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 },

  header: { paddingTop: 12, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E2F0',
    backgroundColor: '#FFFFFF',
  },
  editButtonText: { color: '#6366F1', fontSize: 14, fontWeight: '700' },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F1F5'
  },
  avatarCircle: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: '#6366F1',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 26 },
  userName: { fontSize: 19, fontWeight: '800', color: '#111827' },

  roleBadge: {
    marginTop: 8,
    backgroundColor: '#EEF0FB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#6366F1', textTransform: 'capitalize' },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F1F5'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5'
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIconCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F5F6FA',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  infoIconText: { fontSize: 16 },
  infoTextBlock: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#111827', fontWeight: '600' },

  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutButtonText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },

  // --- Edit modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  modalScrollContent: { paddingBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 18 },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalInput: {
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 16,
  },
  modalInputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  modalHint: { fontSize: 12.5, color: '#9CA3AF', fontWeight: '500', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: { backgroundColor: '#F0F1F5' },
  modalCancelText: { color: '#6B7280', fontSize: 16, fontWeight: '700' },
  modalSaveButton: { backgroundColor: '#6366F1' },
  modalSaveDisabled: { backgroundColor: '#A5B4FC' },
  modalSaveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default ProfileScreen;