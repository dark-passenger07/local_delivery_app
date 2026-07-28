import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Linking, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCustomerVendorStore } from '../../context/customerContext/CustomerVendorContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const VendorScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { getAllVendorProfile, vendorProfiles } = useCustomerVendorStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        await getAllVendorProfile();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getAllVendorProfile();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to refresh vendors');
    } finally {
      setRefreshing(false);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Dial a vendor's phone number using the device's native dialer
  const callVendor = (phone: string) => {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) {
      Alert.alert('No Phone Number', "This vendor hasn't provided a contact number.");
      return;
    }
    const url = `tel:${digits}`;
    Linking.openURL(url) .catch(() => {
        Alert.alert('Unable to Call', 'Something went wrong trying to place the call.');
      });
  };

  const handleViewProducts = (id: string) => {
    navigation.navigate('ProductScreen', { vendorId: id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading vendors…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vendors</Text>
        <Text style={styles.headerSubtitle}>
          {vendorProfiles.length} connected {vendorProfiles.length === 1 ? 'vendor' : 'vendors'}
        </Text>
      </View>

      <FlatList
        data={vendorProfiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIconText}>🏬</Text>
            </View>
            <Text style={styles.emptyTitle}>No connected vendors</Text>
            <Text style={styles.emptyText}>Vendors you're connected to will show up here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleViewProducts(item.id)}
            activeOpacity={0.7}
            style={styles.card}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(item.businessName)}</Text>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.businessName}>{item.businessName}</Text>
              <Text style={styles.businessPhone}>{item.businessPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => callVendor(item.businessPhone)}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.callButtonIcon}>📞</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F6FA' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14, fontWeight: '500' },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2, fontWeight: '500' },

  listContent: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF0FB',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  emptyIconText: { fontSize: 30 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptyText: { textAlign: 'center', color: '#6B7280', fontSize: 14, lineHeight: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F1F5'
  },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  vendorInfo: { flex: 1 },
  businessName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  businessPhone: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  callButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ECFDF5',
    borderWidth: 1, borderColor: '#D1FAE5',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8
  },
  callButtonIcon: { fontSize: 16 },
});