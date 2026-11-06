import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  ScrollView,
  Image,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { useCustomerHomeContext } from "../../context/customerContext/CustomerHomeContext";
import { useAuthStore } from "../../context/vendorContext/AuthContext";
import { useRequestStore } from "../../context/vendorContext/RequestContext";
import { useResponsive } from "../../utils/responsive";
import { COLORS, SHADOWS } from "../../theme/tokens";

const REQUEST_TYPES = [
  { key: "SKIP", label: "Skip Delivery" },
  { key: "INCREASE", label: "Increase Quantity" },
  { key: "DECREASE", label: "Decrease Quantity" },
];

export default function HomeScreen() {
  const { width, isTablet, isLargeTablet, isSmallDevice, gutter, maxWidth, rf, ms, columns } = useResponsive();
  const { user } = useAuthStore();
  const customerName = user?.name?.split(" ")[0] || "there";

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const { addPendingNotification } = useRequestStore()

  const {
    getCustomerSubscribedProducts,
    customerRequest,
    unsubcribeProduct,
    subcribedProducts,
    requestDetails,
    getAllRequestCustomer
  } = useCustomerHomeContext();

  // Component UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedProductUnit, setSelectedProductUnit] = useState<string>("");

  // Unsubscribe specific loading state (tracks which card is mid-flight)
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);

  // Form Field States
  const [message, setMessage] = useState<string>("");
  const [requestType, setRequestType] = useState<string>("");
  const [requestTypeKey, setRequestTypeKey] = useState<string>("");
  const [requestedQuantity, setRequestedQuantity] = useState<string>("");

  // Date Picker Specific States
  const [startDateObj, setStartDateObj] = useState<Date | null>(null);
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<"start" | "end">("start");

  // Fetch products + existing requests on mount (requests are needed to
  // lock dates covered by a pending/accepted SKIP request)
  useEffect(() => {
    addPendingNotification();
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getCustomerSubscribedProducts(),
          getAllRequestCustomer().catch(() => {}),
        ]);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Utility to safely format JS Date objects to a friendly, readable string
  const formatDateString = (date: Date | null): string => {
    if (!date) return "choose a date";
    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // API expects YYYY-MM-DD, kept separate from the friendly display string above
  const formatDateForApi = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getMinimumDate = () => {
    if (pickerMode === "end" && startDateObj) {
      return startDateObj;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const isRequestDisabled = (): boolean => {
    const hour = new Date().getHours();
    return hour >= 0 && hour < 12;
  };

  // Dial a vendor's phone number using the device's native dialer
  const callVendor = (phone: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (!digits) {
      Alert.alert("No Phone Number", "This vendor hasn't shared a phone number yet.");
      return;
    }
    const url = `tel:${digits}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Can't Call Right Now", "Something went wrong. Please try again.");
    });
  };

  const handleOpenForm = (productId: string, productName: string, unit: string) => {
    if (unsubscribingId === productId) {
      return;
    }
    if (isRequestDisabled()) {
      Alert.alert("Requests Disabled", "Requests are currently disabled. Please try again after 12 PM.");
      return;
    }
    // Refresh latest requests so SKIP-locked days are up to date on open.
    getAllRequestCustomer().catch(() => {});
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setSelectedProductUnit(unit);
    setModalVisible(true);
  };

  const closeForm = () => {
    setModalVisible(false);
    setSelectedProductId(null);
    setSelectedProductName("");
    setSelectedProductUnit("");
    setMessage("");
    setRequestType("");
    setRequestTypeKey("");
    setRequestedQuantity("");
    setStartDateObj(null);
    setEndDateObj(null);
  };

  // Open the native platform calendar modal
  const openDatePicker = (mode: "start" | "end") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const applySelectedDate = (chosenDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedDate = new Date(chosenDate);
    normalizedDate.setHours(0, 0, 0, 0);

    if (pickerMode === "start") {
      if (normalizedDate < today) {
        Alert.alert("That Date Has Passed", "Please choose today or a date in the future.");
        return;
      }
      // If the picked start day itself falls inside a locked SKIP range,
      // stop immediately — no request is allowed on those days.
      const lockedForStart = (requestDetails || []).filter((req: any) => {
        const sameProduct = req.productId === selectedProductId || req.product?.id === selectedProductId;
        const status = req.status?.toUpperCase();
        if (!(sameProduct && req.type === "SKIP" && (status === "PENDING" || status === "ACCEPTED"))) return false;
        const rs = new Date(req.start_date); rs.setHours(0, 0, 0, 0);
        const re = new Date(req.end_date); re.setHours(23, 59, 59, 999);
        return normalizedDate >= rs && normalizedDate <= re;
      });
      if (lockedForStart.length > 0) {
        const status = lockedForStart[0].status?.toUpperCase();
        Alert.alert(
          status === "PENDING" ? "Dates Locked" : "Already Skipped",
          status === "PENDING"
            ? "This day is part of a pending skip request. You can't make another request on it until the vendor rejects the skip."
            : "This day is already skipped. You can't make another request on it."
        );
        return;
      }
      setStartDateObj(normalizedDate);

      if (endDateObj && normalizedDate > endDateObj) {
        setEndDateObj(null);
      }
    } else {
      if (!startDateObj) {
        Alert.alert("Choose Start Date First", "Please pick a Start Date before the End Date.");
        return;
      }
      if (normalizedDate < startDateObj) {
        Alert.alert("Date Problem", "End Date cannot be before Start Date.");
        return;
      }
      // The full [start, end] range must not touch a locked SKIP range.
      const overlapsLocked = (requestDetails || []).some((req: any) => {
        const sameProduct = req.productId === selectedProductId || req.product?.id === selectedProductId;
        const status = req.status?.toUpperCase();
        if (!(sameProduct && req.type === "SKIP" && (status === "PENDING" || status === "ACCEPTED"))) return false;
        const rs = new Date(req.start_date); rs.setHours(0, 0, 0, 0);
        const re = new Date(req.end_date); re.setHours(0, 0, 0, 0);
        const s = new Date(startDateObj); s.setHours(0, 0, 0, 0);
        const e = new Date(normalizedDate); e.setHours(0, 0, 0, 0);
        return s <= re && e >= rs;
      });
      if (overlapsLocked) {
        Alert.alert(
          "Dates Locked",
          "This range overlaps days locked by a skip request. You can't make another request on those days until the vendor rejects the skip."
        );
        return;
      }
      setEndDateObj(normalizedDate);
    }
  };

  const handleValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    applySelectedDate(selectedDate);
    setShowPicker(false);
  };

  const handleDismiss = () => {
    setShowPicker(false);
  };

  // Pick a preset request type. Whenever the type changes, the previously
  // picked Start/End dates are cleared so a SKIP range can't leak into an
  // INCREASE/DECREASE request (and vice versa) — the user must re-pick dates.
  const handleSelectRequestType = (key: string, label: string) => {
    if (key !== requestTypeKey) {
      setStartDateObj(null);
      setEndDateObj(null);
    }
    setRequestTypeKey(key);
    setRequestType(label);
    if (key !== "INCREASE" && key !== "DECREASE") {
      setRequestedQuantity("");
    }
  };

  // Dates locked by a PENDING or ACCEPTED SKIP request for the currently
  // selected product. New requests on these days are blocked until the SKIP
  // is REJECTED by the vendor.
  const getLockedSkipRanges = () => {
    if (!selectedProductId) return [];
    return (requestDetails || []).filter((req: any) => {
      const sameProduct =
        req.productId === selectedProductId ||
        req.product?.id === selectedProductId;
      const isSkip = req.type === "SKIP";
      const status = req.status?.toUpperCase();
      const isLocked = status === "PENDING" || status === "ACCEPTED";
      return sameProduct && isSkip && isLocked && req.start_date && req.end_date;
    });
  };

  const formatShortDate = (dateString: string): string => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return formatDateString(d);
  };

  const findOverlappingSkip = (start: Date, end: Date) => {
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(0, 0, 0, 0);
    return getLockedSkipRanges().find((req: any) => {
      const rs = new Date(req.start_date); rs.setHours(0, 0, 0, 0);
      const re = new Date(req.end_date); re.setHours(0, 0, 0, 0);
      return s <= re && e >= rs;
    });
  };

  // Submit form data out to your API engine
  const handleRequestSubmit = async () => {
    if (!requestTypeKey) {
      Alert.alert("Missing Info", "Please choose what kind of request this is.");
      return;
    }
    if (isRequestDisabled()) {
      Alert.alert("Requests Disabled", "Requests are currently disabled. Please try again after 12 PM.");
      return;
    }
    if (!startDateObj || !endDateObj) {
      Alert.alert("Missing Info", "Please choose a Start Date and an End Date.");
      return;
    }
    if (!selectedProductId) {
      Alert.alert("Missing Info", "Please select a product first.");
      return;
    }
    // Block any request (SKIP / INCREASE / DECREASE) on days locked by a
    // pending or accepted SKIP request, until the vendor rejects it.
    const overlappingSkip: any = findOverlappingSkip(startDateObj, endDateObj);
    if (overlappingSkip) {
      const status = overlappingSkip.status?.toUpperCase();
      const range = `${formatShortDate(overlappingSkip.start_date)} - ${formatShortDate(overlappingSkip.end_date)}`;
      Alert.alert(
        status === "PENDING" ? "Dates Locked" : "Already Skipped",
        status === "PENDING"
          ? `You already have a pending skip request (${range}). You can't make another request on those days until the vendor rejects it.`
          : `These days are already skipped (${range}). You can't make another request on skipped days.`
      );
      return;
    }
    if ((requestTypeKey === "INCREASE" || requestTypeKey === "DECREASE") && !requestedQuantity.trim()) {
      Alert.alert("Missing Info", "Please enter a requested quantity for this request type.");
      return;
    }

    setSubmitting(true);
    try {
      await customerRequest({
        productId: selectedProductId,
        message: message || requestType,
        type: requestTypeKey,
        start_date: formatDateForApi(startDateObj),
        end_date: formatDateForApi(endDateObj),
        requestedQuantity: requestedQuantity || undefined
      });

      Alert.alert("Request Sent", "Your request has been sent. The vendor will get back to you soon.");
      closeForm();
    } catch (error: any) {
      Alert.alert("Could Not Send", error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm + perform unsubscribe for a given product
  const handleUnsubscribe = (productId: string, productName: string) => {
    Alert.alert(
      "Stop This Service?",
      `Are you sure you want to stop "${productName}"? You will not get this service anymore.`,
      [
        { text: "No, Keep It", style: "cancel" },
        {
          text: "Yes, Stop It",
          style: "destructive",
          onPress: async () => {
            setUnsubscribingId(productId);
            try {
              await unsubcribeProduct(productId);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Could not stop the service. Please try again.");
            } finally {
              setUnsubscribingId(null);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your services…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={[styles.headerSection, { paddingHorizontal: gutter, paddingTop: ms(8), paddingBottom: ms(20) }]}>
        <View style={styles.headerTopRow}>
          <View style={[styles.headerIconCircle, { width: ms(52), height: ms(52), borderRadius: ms(26) }]}>
            <Text style={[styles.headerIcon, { fontSize: rf(28) }]}>👋</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.greetingText, { fontSize: rf(16) }]}>
              {getGreeting()}, <Text style={styles.customerNameText}>{customerName}</Text>
            </Text>
            <Text style={[styles.headerTitle, { fontSize: rf(28) }]}>Your Services</Text>
          </View>
          <Image source={require("../../assets/helpinghandslogo.png")} style={[styles.headerLogo, { width: ms(40), height: ms(40) }]} />
        </View>
        <View style={[styles.headerBadgeRow, { flexWrap: isSmallDevice ? 'wrap' as const : 'nowrap' as const }]}>
          <View style={[styles.headerBadge, SHADOWS.card]}>
            <Text style={styles.headerBadgeIcon}>📦</Text>
            <Text style={[styles.headerBadgeText, { fontSize: rf(13) }]}>
              {subcribedProducts.length} {subcribedProducts.length === 1 ? "Service" : "Services"}
            </Text>
          </View>
          <View style={[styles.headerBadge, SHADOWS.card]}>
            <Text style={styles.headerBadgeIcon}>⚡</Text>
            <Text style={[styles.headerBadgeText, { fontSize: rf(13) }]}>Delivering Daily</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={subcribedProducts}
        keyExtractor={(item) => item.id}
        style={{ width: '100%', maxWidth: isTablet ? 720 : 520, alignSelf: 'center' }}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: gutter, paddingBottom: ms(24) }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIconText}>📦</Text>
            </View>
            <Text style={styles.emptyTitle}>No Services Yet</Text>
            <Text style={styles.emptyText}>
              When you join a service, it will show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isUnsubscribing = unsubscribingId === item.id;
          return (
            <View style={[styles.productCard, SHADOWS.card, { padding: ms(20) }]}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.productName, { fontSize: rf(18) }]}>{item.productName}</Text>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>Running</Text>
                </View>
              </View>

              <Text style={styles.productDesc}>{item.description}</Text>

              <View style={styles.vendorDivider} />

              <View style={styles.vendorRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{getInitials(item.vendor.businessName)}</Text>
                </View>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorLabel}>Delivered by</Text>
                  <Text style={styles.vendorName}>{item.vendor.businessName}</Text>
                  <Text style={styles.vendorDetail}>{item.vendor.businessPhone}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => callVendor(item.vendor.businessPhone)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.callButtonIcon}>📞</Text>
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.unsubscribeButton]}
                  onPress={() => handleUnsubscribe(item.id, item.productName)}
                  disabled={isUnsubscribing}
                  activeOpacity={0.7}
                >
                  {isUnsubscribing ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Text style={styles.unsubscribeButtonIcon}>✕</Text>
                      <Text style={styles.unsubscribeButtonText}>Stop Service</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.requestButton, SHADOWS.button, (isUnsubscribing || isRequestDisabled()) && styles.disabledActionButton]}
                  onPress={() => handleOpenForm(item.id, item.productName, item.unit)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.requestButtonIcon}>✉️</Text>
                  <Text style={styles.requestButtonText}>Ask Vendor</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Popup Form Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { width: '100%', maxWidth: Math.min(width * 0.92, isTablet ? 560 : 440), alignSelf: 'center' }]}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Send a Request</Text>
              <Text style={styles.modalSubtitle}>For: {selectedProductName}</Text>

              <Text style={styles.label}>1. What do you need?</Text>
              <View style={styles.chipWrap}>
                {REQUEST_TYPES.map((opt) => {
                  const isSelected = requestTypeKey === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => handleSelectRequestType(opt.key, opt.label)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {(requestTypeKey === "INCREASE" || requestTypeKey === "DECREASE") && (
                <TextInput
                  style={styles.input}
                  placeholder={`Requested quantity (${selectedProductUnit || 'unit'})`}
                  placeholderTextColor="#9CA3AF"
                  value={requestedQuantity}
                  onChangeText={setRequestedQuantity}
                  keyboardType="numeric"
                />
              )}

              <Text style={styles.label}>2. Choose your dates</Text>
              <View style={[styles.dateRow, { flexDirection: isSmallDevice ? 'column' as const : 'row' as const, gap: ms(12) }]}>
                <View style={[styles.dateColumn, { flex: isSmallDevice ? 0 : 1 }]}>
                  <Text style={styles.dateColumnLabel}>Start Date</Text>
                  <TouchableOpacity style={styles.datePickerButton} onPress={() => openDatePicker("start")} activeOpacity={0.8}>
                    <Text style={styles.datePickerIcon}>📅</Text>
                    <Text style={startDateObj ? styles.dateText : styles.placeholderText}>
                      {formatDateString(startDateObj)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.dateColumn, { flex: isSmallDevice ? 0 : 1 }]}>
                  <Text style={styles.dateColumnLabel}>End Date</Text>
                  <TouchableOpacity style={styles.datePickerButton} onPress={() => openDatePicker("end")} activeOpacity={0.8}>
                    <Text style={styles.datePickerIcon}>📅</Text>
                    <Text style={endDateObj ? styles.dateText : styles.placeholderText}>
                      {formatDateString(endDateObj)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>3. Add a note (Explain your request breifly)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write any extra details here"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </ScrollView>

            {showPicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={
                    pickerMode === "start"
                      ? (startDateObj || new Date())
                      : (endDateObj || startDateObj || new Date())
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={getMinimumDate()}
                  onValueChange={handleValueChange}
                  onDismiss={handleDismiss}
                />
              </View>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeForm}
                disabled={submitting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRequestSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FB" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F6FB" },
  loadingText: { marginTop: 12, color: "#4B5563", fontSize: 16, fontWeight: "600" },

  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#E0E7FF"
  },
  headerIcon: { fontSize: 28 },
  headerLogo: { width: 40, height: 40, resizeMode: "contain" },
  headerTextContainer: { flex: 1 },
  greetingText: { fontSize: 16, color: "#64748B", fontWeight: "600" },
  customerNameText: { color: "#2563EB", fontWeight: "800" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginTop: 2
  },
  headerBadgeRow: {
    flexDirection: "row",
    gap: 10
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerBadgeIcon: { fontSize: 18, marginRight: 6 },
  headerBadgeText: { fontSize: 13, fontWeight: "700", color: "#334155" },

  listContent: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },

  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 80, paddingHorizontal: 32 },
  emptyIconCircle: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: "#E7ECFB",
    alignItems: "center", justifyContent: "center", marginBottom: 18
  },
  emptyIconText: { fontSize: 36 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  emptyText: { textAlign: "center", color: "#475569", fontSize: 16, lineHeight: 22 },

  productCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEF1F8"
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 20, fontWeight: "800", color: "#0F172A", flexShrink: 1, marginRight: 8 },

  activeBadge: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#DCFCE7",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20
  },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#16A34A", marginRight: 6 },
  activeBadgeText: { fontSize: 13, fontWeight: "800", color: "#15803D" },

  productDesc: { fontSize: 15, color: "#475569", marginTop: 8, lineHeight: 21 },

  vendorDivider: { height: 1, backgroundColor: "#EEF1F8", marginVertical: 16 },

  vendorRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#2563EB",
    alignItems: "center", justifyContent: "center", marginRight: 14
  },
  avatarText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  vendorInfo: { flex: 1 },
  vendorLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  vendorName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 1 },
  vendorDetail: { fontSize: 14, color: "#64748B", marginTop: 2 },

  callButton: {
    width: 60, height: 52, borderRadius: 14,
    backgroundColor: "#DCFCE7",
    borderWidth: 1.5, borderColor: "#BBF7D0",
    alignItems: "center", justifyContent: "center",
    marginLeft: 8
  },
  callButtonIcon: { fontSize: 18 },
  callButtonText: { fontSize: 11, fontWeight: "800", color: "#15803D", marginTop: 1 },

  actionRow: { flexDirection: "row", marginTop: 18, gap: 12 },
  actionButton: {
    flex: 1, flexDirection: "row", paddingVertical: 15, borderRadius: 14,
    alignItems: "center", justifyContent: "center", gap: 6
  },
  unsubscribeButton: { backgroundColor: "#FEF2F2", borderWidth: 1.5, borderColor: "#FECACA" },
  unsubscribeButtonIcon: { color: "#DC2626", fontWeight: "800", fontSize: 14 },
  unsubscribeButtonText: { color: "#DC2626", fontWeight: "800", fontSize: 15 },
  requestButton: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  disabledActionButton: {
    opacity: 0.5,
  },
  requestButtonIcon: { fontSize: 15 },
  requestButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "flex-end" },
  modalContainer: {
    flex: 1,
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: 'column'
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  modalScrollContent: {
    paddingBottom: 8
  },
  modalHandle: {
    width: 44, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0",
    alignSelf: "center", marginBottom: 18
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A", textAlign: "center" },
  modalSubtitle: { fontSize: 15, color: "#2563EB", fontWeight: "700", textAlign: "center", marginTop: 4, marginBottom: 22 },

  label: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 10 },
  input: {
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, padding: 14,
    marginBottom: 16, fontSize: 16, backgroundColor: "#F8FAFC", color: "#0F172A"
  },
  textArea: { height: 100, textAlignVertical: "top" },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  chip: {
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0",
    minHeight: 44, alignItems: "center", justifyContent: "center"
  },
  chipSelected: { backgroundColor: "#DBEAFE", borderColor: "#2563EB" },
  chipText: { fontSize: 15, fontWeight: "700", color: "#475569" },
  chipTextSelected: { color: "#1D4ED8" },

  dateRow: { flexDirection: "row" as const, gap: 12 },
  dateColumn: { flex: 1 },
  dateColumnLabel: { fontSize: 13, fontWeight: "700", color: "#64748B", marginBottom: 6 },
  datePickerButton: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 14, padding: 14,
    marginBottom: 16, backgroundColor: "#F8FAFC",
    minHeight: 52
  },
  datePickerIcon: { fontSize: 16 },
  dateText: { fontSize: 15, color: "#0F172A", fontWeight: "700" },
  placeholderText: { fontSize: 14, color: "#94A3B8", fontWeight: "600" },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0"
  },

  modalActionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 12, paddingHorizontal: 24, paddingBottom: 34 },
  modalButton: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: "center", minHeight: 52 },
  cancelButton: { backgroundColor: "#F1F5F9" },
  cancelButtonText: { color: "#334155", fontWeight: "800", fontSize: 15 },
  submitButton: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 }
});