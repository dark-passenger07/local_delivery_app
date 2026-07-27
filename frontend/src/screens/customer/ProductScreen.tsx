import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
  RefreshControl,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCustomerVendorStore } from '../../context/customerContext/CustomerVendorContext';
import { useCustomerHomeContext } from '../../context/customerContext/CustomerHomeContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type ProductScreenRouteParams = {
  ProductScreen: {
    vendorId: string
  }
}

const ProductScreen = () => {
  const route = useRoute<RouteProp<ProductScreenRouteParams, 'ProductScreen'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { vendorId } = route.params;
  const { getAllVendorProducts, vendorProducts, clearVendorProducts, subscribeProduct } = useCustomerVendorStore();
  const { getCustomerSubscribedProducts, subcribedProducts } = useCustomerHomeContext();

  const [loading, setLoading] = useState<boolean>(true);

  // Simplified single-step modal state logic
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [dailyQuantity, setDailyQuantity] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

   useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getAllVendorProducts(vendorId),
          getCustomerSubscribedProducts()
        ]);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    return () => {
      clearVendorProducts();
    };
  }, [vendorId]);

  useEffect(() => {
    setSubscribedIds(new Set(subcribedProducts.map(p => p.id)));
  }, [subcribedProducts]);

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatDateString = (date: Date | null): string => {
    if (!date) return 'Choose start date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForApi = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(selectedDate);
    chosenDate.setHours(0, 0, 0, 0);
    if (chosenDate < today) {
      Alert.alert('Invalid Date', 'Please choose today or a future date.');
      return;
    }
    setStartDateObj(chosenDate);
    setStartDate(formatDateForApi(chosenDate));
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
  };

  const initiateSubscriptionFlow = (productId: string) => {
    setSelectedProductId(productId);
    setStartDate('');
    setStartDateObj(null);
    setShowDatePicker(false);
    setIsConfirmOpen(true);
  };

  const executeSubscription = async () => {
    if (!selectedProductId) return;

    setSubscribing(true);
    try {
      await subscribeProduct(selectedProductId, dailyQuantity, startDate)
      setSubscribedIds((prev) => new Set(prev).add(selectedProductId));
      Alert.alert('Success', 'You have successfully subscribed to this product!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
      cancelSubscriptionFlow();
    }
  };

  const cancelSubscriptionFlow = () => {
    setIsConfirmOpen(false);
    setSelectedProductId(null);
    setStartDate('');
    setStartDateObj(null);
    setShowDatePicker(false);
  };

  const activeProduct = vendorProducts.find((p) => p.id === selectedProductId);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading products…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <View style={styles.backButtonIconWrap}>
            <Text style={styles.backButtonIcon}>←</Text>
          </View>
          <Text style={styles.backButtonText}>Vendors</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <Text style={styles.headerSubtitle}>
          {vendorProducts.length} {vendorProducts.length === 1 ? 'product' : 'products'} available
        </Text>
      </View>

      <FlatList
        data={vendorProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIconText}>🗂️</Text>
            </View>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>This vendor hasn't listed any products.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSubscribed = subscribedIds.has(item.id);
          return (
            <View style={styles.productCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(item.productName)}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.subscribeButton, isSubscribed && styles.subscribedButton]}
                onPress={() => initiateSubscriptionFlow(item.id)}
                disabled={isSubscribed}
                activeOpacity={0.85}
              >
                <Text style={[styles.subscribeButtonText, isSubscribed && styles.subscribedButtonText]}>
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* --- SINGLE CONFIRMATION MODAL --- */}
      <Modal
        visible={isConfirmOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSubscriptionFlow}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIconText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Confirm Subscription</Text>
            <Text style={styles.modalMessage}>
               Are you sure you want to subscribe to{' '}
               <Text style={styles.modalMessageBold}>{activeProduct?.productName}</Text>?
             </Text>

             {activeProduct?.unit && (
               <View style={styles.unitBadge}>
                 <Text style={styles.unitText}>{activeProduct.unit}</Text>
               </View>
             )}

             <View style={styles.formField}>
              <Text style={styles.formLabel}>Daily Quantity</Text>
              <TextInput
                style={styles.formInput}
                value={dailyQuantity}
                onChangeText={setDailyQuantity}
                keyboardType="numeric"
                placeholder="e.g. 1"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Start Date</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={openDatePicker} activeOpacity={0.8}>
                <Text style={styles.datePickerIcon}>📅</Text>
                <Text style={startDate ? styles.dateText : styles.placeholderText}>
                  {formatDateString(startDateObj)}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={startDateObj || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onValueChange={onDateChange}
              />
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelBtn]}
                onPress={cancelSubscriptionFlow}
                disabled={subscribing}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmBtn]}
                onPress={executeSubscription}
                disabled={subscribing}
                activeOpacity={0.85}
              >
                {subscribing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F6FA' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14, fontWeight: '500' },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButtonIcon: { fontSize: 16, color: '#6366F1', fontWeight: '700' },
  backButtonText: { color: '#6366F1', fontSize: 14, fontWeight: '700' },
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

  productCard: {
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
  productInfo: { flex: 1, paddingRight: 10 },
  productName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  productDescription: { fontSize: 13, color: '#6B7280', marginTop: 2, lineHeight: 18 },

  subscribeButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  subscribeButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  subscribedButton: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    shadowOpacity: 0,
    elevation: 0
  },
  subscribedButtonText: { color: '#059669' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6
  },
  modalIconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEF0FB',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14
  },
  modalIconText: { fontSize: 22, color: '#6366F1', fontWeight: '800' },
  modalTitle: { fontSize: 19, fontWeight: '800', marginBottom: 8, color: '#111827' },
  modalMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 22, lineHeight: 21 },
  modalMessageBold: { fontWeight: '700', color: '#111827' },
  modalButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  confirmBtn: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  cancelBtnText: { color: '#374151', fontWeight: '700', fontSize: 14 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  formField: { width: '100%', marginBottom: 14 },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 6 },
  formInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB'
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB'
  },
  datePickerIcon: { fontSize: 16 },
  dateText: { fontSize: 15, color: '#111827', fontWeight: '700' },
   placeholderText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },

   unitBadge: {
     alignSelf: 'center',
     backgroundColor: '#EEF0FB',
     paddingHorizontal: 12,
     paddingVertical: 4,
     borderRadius: 8,
     marginBottom: 16,
     marginTop: 4
   },
   unitText: { fontSize: 13, fontWeight: '700', color: '#6366F1' }
 });

export default ProductScreen;