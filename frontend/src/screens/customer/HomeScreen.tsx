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
  Dimensions,
  Linking,
  ScrollView,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { useCustomerHomeContext } from "../../context/customerContext/CustomerHomeContext";
import { useAuthStore } from "../../context/vendorContext/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;
const scale = SCREEN_WIDTH / BASE_WIDTH;

const REQUEST_TYPES = [
  { key: "NOTE", label: "General Note" },
  { key: "SKIP", label: "Skip Delivery" },
  { key: "INCREASE", label: "Increase Quantity" },
  { key: "DECREASE", label: "Decrease Quantity" },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const customerName = user?.name?.split(" ")[0] || "there";

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const {
    getCustomerSubscribedProducts,
    customerRequest,
    unsubcribeProduct,
    subcribedProducts
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

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        await getCustomerSubscribedProducts();
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

  // Pick a preset request type
  const handleSelectRequestType = (key: string, label: string) => {
    setRequestTypeKey(key);
    setRequestType(label);
    if (key !== "INCREASE" && key !== "DECREASE") {
      setRequestedQuantity("");
    }
  };

  // Submit form data out to your API engine
  const handleRequestSubmit = async () => {
    if (!requestTypeKey) {
      Alert.alert("Missing Info", "Please choose what kind of request this is.");
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerSection}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerIconCircle}>
            <Text style={styles.headerIcon}>👋</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingText}>
              {getGreeting()}, <Text style={styles.customerNameText}>{customerName}</Text>
            </Text>
            <Text style={styles.headerTitle}>Your Services</Text>
          </View>
          <Image source={require("../../assets/helpinghandslogo.png")} style={styles.headerLogo} />
        </View>
        <View style={styles.headerBadgeRow}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeIcon}>📦</Text>
            <Text style={styles.headerBadgeText}>
              {subcribedProducts.length} {subcribedProducts.length === 1 ? "Service" : "Services"}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeIcon}>⚡</Text>
            <Text style={styles.headerBadgeText}>Delivering Daily</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={subcribedProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
            <View style={styles.productCard}>
              <View style={styles.cardTopRow}>
                <Text style={styles.productName}>{item.productName}</Text>
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
                  style={[styles.actionButton, styles.requestButton]}
                  onPress={() => handleOpenForm(item.id, item.productName, item.unit)}
                  disabled={isUnsubscribing}
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
          <View style={styles.modalContainer}>
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
              <View style={styles.dateRow}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnLabel}>Start Date</Text>
                  <TouchableOpacity style={styles.datePickerButton} onPress={() => openDatePicker("start")} activeOpacity={0.8}>
                    <Text style={styles.datePickerIcon}>📅</Text>
                    <Text style={startDateObj ? styles.dateText : styles.placeholderText}>
                      {formatDateString(startDateObj)}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateColumn}>
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
                  minimumDate={pickerMode === "end" && startDateObj ? startDateObj : new Date()}
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
  loadingText: { marginTop: 12 * scale, color: "#4B5563", fontSize: 16 * scale, fontWeight: "600" },

  headerSection: {
    paddingHorizontal: 20 * scale,
    paddingTop: 8 * scale,
    paddingBottom: 20 * scale
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16 * scale
  },
  headerIconCircle: {
    width: 52 * scale,
    height: 52 * scale,
    borderRadius: 26 * scale,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14 * scale,
    borderWidth: 2,
    borderColor: "#E0E7FF"
  },
  headerIcon: { fontSize: 28 * scale },
  headerLogo: { width: 40 * scale, height: 40 * scale, resizeMode: "contain" },
  headerTextContainer: { flex: 1 },
  greetingText: { fontSize: 16 * scale, color: "#64748B", fontWeight: "600" },
  customerNameText: { color: "#2563EB", fontWeight: "800" },
  headerTitle: {
    fontSize: 28 * scale,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5 * scale,
    marginTop: 2 * scale
  },
  headerBadgeRow: {
    flexDirection: "row",
    gap: 10 * scale
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14 * scale,
    paddingVertical: 10 * scale,
    borderRadius: 14 * scale,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerBadgeIcon: { fontSize: 18 * scale, marginRight: 6 * scale },
  headerBadgeText: { fontSize: 13 * scale, fontWeight: "700", color: "#334155" },

  listContent: { paddingHorizontal: 20 * scale, paddingBottom: 24 * scale, flexGrow: 1 },

  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 80 * scale, paddingHorizontal: 32 * scale },
  emptyIconCircle: {
    width: 84 * scale, height: 84 * scale, borderRadius: 42 * scale, backgroundColor: "#E7ECFB",
    alignItems: "center", justifyContent: "center", marginBottom: 18 * scale
  },
  emptyIconText: { fontSize: 36 * scale },
  emptyTitle: { fontSize: 20 * scale, fontWeight: "800", color: "#0F172A", marginBottom: 6 * scale },
  emptyText: { textAlign: "center", color: "#475569", fontSize: 16 * scale, lineHeight: 22 * scale },

  productCard: {
    backgroundColor: "#FFFFFF",
    padding: 20 * scale,
    borderRadius: 20 * scale,
    marginBottom: 18 * scale,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 * scale },
    shadowOpacity: 0.07,
    shadowRadius: 14 * scale,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEF1F8"
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 20 * scale, fontWeight: "800", color: "#0F172A", flexShrink: 1, marginRight: 8 * scale },

  activeBadge: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#DCFCE7",
    paddingHorizontal: 10 * scale, paddingVertical: 6 * scale, borderRadius: 20 * scale
  },
  activeDot: { width: 7 * scale, height: 7 * scale, borderRadius: 4 * scale, backgroundColor: "#16A34A", marginRight: 6 * scale },
  activeBadgeText: { fontSize: 13 * scale, fontWeight: "800", color: "#15803D" },

  productDesc: { fontSize: 15 * scale, color: "#475569", marginTop: 8 * scale, lineHeight: 21 * scale },

  vendorDivider: { height: 1 * scale, backgroundColor: "#EEF1F8", marginVertical: 16 * scale },

  vendorRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 48 * scale, height: 48 * scale, borderRadius: 24 * scale, backgroundColor: "#2563EB",
    alignItems: "center", justifyContent: "center", marginRight: 14 * scale
  },
  avatarText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 * scale },
  vendorInfo: { flex: 1 },
  vendorLabel: { fontSize: 12 * scale, color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 * scale },
  vendorName: { fontSize: 16 * scale, fontWeight: "700", color: "#0F172A", marginTop: 1 * scale },
  vendorDetail: { fontSize: 14 * scale, color: "#64748B", marginTop: 2 * scale },

  callButton: {
    width: 60 * scale, height: 52 * scale, borderRadius: 14 * scale,
    backgroundColor: "#DCFCE7",
    borderWidth: 1.5 * scale, borderColor: "#BBF7D0",
    alignItems: "center", justifyContent: "center",
    marginLeft: 8 * scale
  },
  callButtonIcon: { fontSize: 18 * scale },
  callButtonText: { fontSize: 11 * scale, fontWeight: "800", color: "#15803D", marginTop: 1 * scale },

  actionRow: { flexDirection: "row", marginTop: 18 * scale, gap: 12 * scale },
  actionButton: {
    flex: 1, flexDirection: "row", paddingVertical: 15 * scale, borderRadius: 14 * scale,
    alignItems: "center", justifyContent: "center", gap: 6 * scale
  },
  unsubscribeButton: { backgroundColor: "#FEF2F2", borderWidth: 1.5 * scale, borderColor: "#FECACA" },
  unsubscribeButtonIcon: { color: "#DC2626", fontWeight: "800", fontSize: 14 * scale },
  unsubscribeButtonText: { color: "#DC2626", fontWeight: "800", fontSize: 15 * scale },
  requestButton: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 * scale },
    shadowOpacity: 0.25,
    shadowRadius: 8 * scale,
    elevation: 3
  },
  requestButtonIcon: { fontSize: 15 * scale },
  requestButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 * scale },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "flex-end" },
  modalContainer: {
    flex: 1,
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28 * scale,
    borderTopRightRadius: 28 * scale,
    flexDirection: 'column'
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 24 * scale,
    paddingTop: 24 * scale
  },
  modalScrollContent: {
    paddingBottom: 8 * scale
  },
  modalHandle: {
    width: 44 * scale, height: 5 * scale, borderRadius: 3 * scale, backgroundColor: "#E2E8F0",
    alignSelf: "center", marginBottom: 18 * scale
  },
  modalTitle: { fontSize: 22 * scale, fontWeight: "800", color: "#0F172A", textAlign: "center" },
  modalSubtitle: { fontSize: 15 * scale, color: "#2563EB", fontWeight: "700", textAlign: "center", marginTop: 4 * scale, marginBottom: 22 * scale },

  label: { fontSize: 16 * scale, fontWeight: "800", color: "#1E293B", marginBottom: 10 * scale },
  input: {
    borderWidth: 1.5 * scale, borderColor: "#E2E8F0", borderRadius: 14 * scale, padding: 14 * scale,
    marginBottom: 16 * scale, fontSize: 16 * scale, backgroundColor: "#F8FAFC", color: "#0F172A"
  },
  textArea: { height: 100 * scale, textAlignVertical: "top" },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 * scale, marginBottom: 18 * scale },
  chip: {
    paddingVertical: 12 * scale, paddingHorizontal: 16 * scale, borderRadius: 12 * scale,
    backgroundColor: "#F1F5F9", borderWidth: 1.5 * scale, borderColor: "#E2E8F0",
    minHeight: 44 * scale, alignItems: "center", justifyContent: "center"
  },
  chipSelected: { backgroundColor: "#DBEAFE", borderColor: "#2563EB" },
  chipText: { fontSize: 15 * scale, fontWeight: "700", color: "#475569" },
  chipTextSelected: { color: "#1D4ED8" },

  dateRow: { flexDirection: SCREEN_WIDTH < 340 ? "column" : "row", gap: 12 * scale },
  dateColumn: { flex: SCREEN_WIDTH < 340 ? 0 : 1 },
  dateColumnLabel: { fontSize: 13 * scale, fontWeight: "700", color: "#64748B", marginBottom: 6 * scale },
  datePickerButton: {
    flexDirection: "row", alignItems: "center", gap: 8 * scale,
    borderWidth: 1.5 * scale, borderColor: "#E2E8F0", borderRadius: 14 * scale, padding: 14 * scale,
    marginBottom: 16 * scale, backgroundColor: "#F8FAFC",
    minHeight: 52 * scale
  },
  datePickerIcon: { fontSize: 16 * scale },
  dateText: { fontSize: 15 * scale, color: "#0F172A", fontWeight: "700" },
  placeholderText: { fontSize: 14 * scale, color: "#94A3B8", fontWeight: "600" },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10 * scale,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0"
  },

  modalActionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 * scale, gap: 12 * scale, paddingHorizontal: 24 * scale, paddingBottom: 34 * scale },
  modalButton: { flex: 1, paddingVertical: 16 * scale, borderRadius: 14 * scale, alignItems: "center", minHeight: 52 * scale },
  cancelButton: { backgroundColor: "#F1F5F9" },
  cancelButtonText: { color: "#334155", fontWeight: "800", fontSize: 15 * scale },
  submitButton: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 * scale },
    shadowOpacity: 0.25,
    shadowRadius: 8 * scale,
    elevation: 3
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 * scale }
});