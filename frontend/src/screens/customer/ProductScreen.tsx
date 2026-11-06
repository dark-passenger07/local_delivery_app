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
import PriceHistoryModal, { ProductPriceHistoryEntry } from '../../components/PriceHistoryModal';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { useResponsive } from '../../utils/responsive';
import { COLORS, SHADOWS } from '../../theme/tokens';

type ProductScreenRouteParams = {
  ProductScreen: {
    vendorId: string
  }
}

const ProductScreen = () => {
  const { width, isTablet, isLargeTablet, isSmallDevice, gutter, maxWidth, rf, ms, columns } = useResponsive();
  void isLargeTablet; void maxWidth; void columns; void isSmallDevice;
  const route = useRoute<RouteProp<ProductScreenRouteParams, 'ProductScreen'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { vendorId } = route.params;
  const { getAllVendorProducts, vendorProducts, clearVendorProducts, subscribeProduct, getProductPriceHistory } = useCustomerVendorStore();
  const { getCustomerSubscribedProducts, subcribedProducts } = useCustomerHomeContext();

  const [loading, setLoading] = useState<boolean>(true);

  // Simplified single-step modal state logic
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set());
  const [dailyQuantity, setDailyQuantity] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Price-history modal state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyProduct, setHistoryProduct] = useState<{ productName: string; unit: string } | null>(null);
  const [historyEntries, setHistoryEntries] = useState<ProductPriceHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

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

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const onDateChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    const tomorrow = getTomorrow();
    const chosenDate = new Date(selectedDate);
    chosenDate.setHours(0, 0, 0, 0);
    if (chosenDate < tomorrow) {
      Alert.alert('Invalid Date', 'Subscriptions cannot start today. Please choose tomorrow or a future date.');
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
    setDailyQuantity('0');
    setStartDate('');
    setStartDateObj(null);
    setShowDatePicker(false);
    setIsConfirmOpen(true);
  };

  const executeSubscription = async () => {
    if (!selectedProductId) return;

    const parsedQuantity = Number(dailyQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a daily quantity greater than 0.');
      return;
    }

    // Price now comes from the product itself (set by the vendor). Guard
    // against products the vendor hasn't priced yet — the backend rejects
    // these too, so surface a clear message before the request.
    const productPrice = Number(activeProduct?.price) || 0;
    if (productPrice <= 0) {
      Alert.alert(
        'Price not set',
        "This product doesn't have a price yet. Please ask the vendor to set one before subscribing."
      );
      return;
    }

    if (!startDate) {
      Alert.alert('Start Date Required', 'Please choose a start date for your subscription.');
      return;
    }

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

  const openPriceHistory = async (product: { id: string; productName: string; unit: string }) => {
    setHistoryProduct({ productName: product.productName, unit: product.unit });
    setHistoryEntries([]);
    setHistoryError(null);
    setHistoryLoading(true);
    setIsHistoryOpen(true);
    try {
      const entries = await getProductPriceHistory(product.id);
      setHistoryEntries(entries);
    } catch (error: any) {
      setHistoryError(error.message || 'Failed to load price history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closePriceHistory = () => {
    setIsHistoryOpen(false);
    setHistoryProduct(null);
    setHistoryEntries([]);
    setHistoryError(null);
  };

  const activeProduct = vendorProducts.find((p) => p.id === selectedProductId);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading products…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { paddingHorizontal: ms(14), paddingVertical: ms(8) }]} activeOpacity={0.7}>
          <View style={styles.backButtonIconWrap}>
            <Text style={[styles.backButtonIcon, { color: COLORS.primary }]}>←</Text>
          </View>
          <Text style={[styles.backButtonText, { color: COLORS.primary }]}>Vendors</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: rf(26) }]}>Products</Text>
        <Text style={styles.headerSubtitle}>
          {vendorProducts.length} {vendorProducts.length === 1 ? 'product' : 'products'} available
        </Text>
      </View>

      <FlatList
        data={vendorProducts}
        keyExtractor={(item) => item.id}
        key={isTablet ? 't' : 'p'}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? { gap: ms(12) } : undefined}
        style={{ width: '100%', maxWidth: isTablet ? 720 : 520, alignSelf: 'center' }}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: gutter, paddingBottom: ms(24) }]}
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
          const priceValue = Number(item.price) || 0;
          const unitLabel = String(item.unit || 'unit').toLowerCase();
          return (
            <View style={[styles.productCard, SHADOWS.card, { flex: isTablet ? 1 : 0 }]}>
              <View style={[styles.avatarCircle, { width: ms(44), height: ms(44), borderRadius: ms(22), backgroundColor: COLORS.primary }]}>
                <Text style={styles.avatarText}>{getInitials(item.productName)}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                {priceValue > 0 ? (
                  <TouchableOpacity
                    onPress={() =>
                      openPriceHistory({
                        id: item.id,
                        productName: item.productName,
                        unit: String(item.unit || 'unit'),
                      })
                    }
                    activeOpacity={0.7}
                    style={styles.priceRow}
                  >
                    <Text style={styles.productPrice}>
                      ₹{priceValue.toFixed(2)} <Text style={styles.productPriceUnit}>/ {unitLabel}</Text>
                    </Text>
                    <Text style={styles.priceHistoryHint}>🕘 history</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.productPriceMissing}>Price not set yet</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.subscribeButton, SHADOWS.button, { paddingVertical: ms(10), paddingHorizontal: ms(16) }, isSubscribed && styles.subscribedButton]}
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
          <View style={[styles.modalContent, SHADOWS.card, { width: '100%', maxWidth: Math.min(width * 0.92, isTablet ? 560 : 440), maxHeight: '90%' }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: ms(8) }}
              style={{ width: '100%' }}
              keyboardShouldPersistTaps="handled"
            >
            <View style={styles.modalIconCircle}>
              <Text style={[styles.modalIconText, { color: COLORS.primary }]}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Confirm Subscription</Text>
            <Text style={styles.modalMessage}>
               Are you sure you want to subscribe to{' '}
               <Text style={styles.modalMessageBold}>{activeProduct?.productName}</Text>?
             </Text>

              {activeProduct?.unit && (
                <View style={styles.unitBadge}>
                  <Text style={[styles.unitText, { color: COLORS.primary }]}>{activeProduct.unit}</Text>
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
              <Text style={styles.formLabel}>Price per unit</Text>
              <View style={styles.priceDisplay}>
                <Text style={[styles.priceDisplayText, { color: COLORS.primary }]}>
                  {Number(activeProduct?.price) > 0
                    ? `₹${Number(activeProduct?.price).toFixed(2)}`
                    : 'Not set'}
                </Text>
                {activeProduct?.unit ? (
                  <Text style={styles.priceDisplayUnit}>per {activeProduct.unit.toLowerCase()}</Text>
                ) : null}
              </View>
              <Text style={styles.priceHint}>
                Set by the vendor. Your bill is this price × the quantity delivered.
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Start Date</Text>
              <TouchableOpacity style={[styles.datePickerButton, { minHeight: ms(52) }]} onPress={openDatePicker} activeOpacity={0.8}>
                <Text style={styles.datePickerIcon}>📅</Text>
                <Text style={startDate ? styles.dateText : styles.placeholderText}>
                  {formatDateString(startDateObj)}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={startDateObj || getTomorrow()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={getTomorrow()}
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
                style={[styles.modalButton, styles.confirmBtn, SHADOWS.button]}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PriceHistoryModal
        visible={isHistoryOpen}
        onClose={closePriceHistory}
        productName={historyProduct?.productName}
        unit={historyProduct?.unit}
        entries={historyEntries}
        loading={historyLoading}
        error={historyError}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6FB' },
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
  backButtonIcon: { fontSize: 16, color: '#2563EB', fontWeight: '700' },
  backButtonText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
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
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  productInfo: { flex: 1, paddingRight: 10 },
  productName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  productDescription: { fontSize: 13, color: '#6B7280', marginTop: 2, lineHeight: 18 },
  productPrice: { fontSize: 14, fontWeight: '800', color: '#2563EB', marginTop: 6 },
  productPriceUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  productPriceMissing: { fontSize: 12, fontWeight: '600', color: '#DC2626', marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  priceHistoryHint: { fontSize: 11, fontWeight: '700', color: '#2563EB', marginTop: 6 },

  subscribeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#2563EB',
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
    maxWidth: 440,
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
  modalIconText: { fontSize: 22, color: '#2563EB', fontWeight: '800' },
  modalTitle: { fontSize: 19, fontWeight: '800', marginBottom: 8, color: '#0F172A' },
  modalMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 22, lineHeight: 21 },
  modalMessageBold: { fontWeight: '700', color: '#0F172A' },
  modalButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  confirmBtn: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
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
    color: '#0F172A',
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
  dateText: { fontSize: 15, color: '#0F172A', fontWeight: '700' },
   placeholderText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },

   priceHint: { fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 16 },

   priceDisplay: {
     flexDirection: 'row',
     alignItems: 'baseline',
     gap: 8,
     borderWidth: 1.5,
     borderColor: '#E5E7EB',
     borderRadius: 12,
     paddingHorizontal: 14,
     paddingVertical: 12,
     backgroundColor: '#F3F4FF',
   },
   priceDisplayText: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
   priceDisplayUnit: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

   unitBadge: {
     alignSelf: 'center',
     backgroundColor: '#EEF0FB',
     paddingHorizontal: 12,
     paddingVertical: 4,
     borderRadius: 8,
     marginBottom: 16,
     marginTop: 4
   },
   unitText: { fontSize: 13, fontWeight: '700', color: '#2563EB' }
 });

export default ProductScreen;