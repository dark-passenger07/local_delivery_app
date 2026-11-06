import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsive } from "../../utils/responsive";
import { COLORS, SHADOWS } from "../../theme/tokens";
import { useVendorCustomerStore } from "../../context/vendorContext/vendorCustomerContext";
import { useCustomerSubscriptionStore } from "../../context/vendorContext/CustomerSubscriptionContex";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const AVATAR_COLORS = [
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#FBEAF0", text: "#72243E" },
  { bg: "#EDE8FE", text: "#4C2D8A" },
  { bg: "#FEF3E0", text: "#7A5200" },
];

const getInitial = (name?: string) => (name?.trim()?.[0] || "?").toUpperCase();
const getAvatarColor = (id: string) => {
  const sum = id
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const CustomerScreen = () => {
  const { addCustomer, deleteCustomers, allCustomers } =
    useVendorCustomerStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const { isTablet, gutter, ms } = useResponsive();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [addCustomerError, setAddCustomerError] = useState("");
  const { subscribedProducts, subscribedCustomers } = useCustomerSubscriptionStore();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      try {
        await subscribedCustomers();
      } catch (subErr) {
        console.log("Failed to load subscriptions:", subErr);
      }
      const res = await allCustomers();
      if (res?.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async () => {
    if (!phone.trim()) {
      setAddCustomerError("Please enter a phone number.");
      return;
    }

    try {
      setAddCustomerError("");
      const res = await addCustomer(phone);

      if (res?.success) {
        setPhone("");
        setAddCustomerError("");
        setAddModalVisible(false);
        fetchCustomers();
      }
    } catch (err: any) {
      setAddCustomerError(err.message || "Error adding customer");
      console.log(err);
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    Alert.alert(
      "Remove customer",
      `Are you sure you want to remove ${userName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This action cannot be undone. Do you really want to remove this customer?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const res = await deleteCustomers(userId);
                      if (res?.success) {
                        fetchCustomers();
                      }
                    } catch (err) {
                      console.log(err);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() =>{
      Alert.alert("Can't Call Right Now", "Something went wrong. Please try again.");
    });
  };

  const getSubscriptionCount = (customerId: string) => {
    return subscribedProducts.filter(
      (sub) => sub.vendorCustomers?.customerId === customerId
    ).length;
  };

  const sections = useMemo(() => {
    let filtered = customers;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = customers.filter(
        (item) =>
          item.user?.name?.toLowerCase().includes(q) ||
          item.user?.phone?.toLowerCase().includes(q) ||
          item.user?.address?.toLowerCase().includes(q)
      );
    }

    const subscribed: any[] = [];
    const unsubscribed: any[] = [];

    filtered.forEach((item) => {
      if (getSubscriptionCount(item.user.id) > 0) {
        subscribed.push(item);
      } else {
        unsubscribed.push(item);
      }
    });

    return [
      { title: "Subscribed Customers", data: subscribed, count: subscribed.length },
      { title: "Customers Without Subscriptions", data: unsubscribed, count: unsubscribed.length },
    ];
  }, [search, customers, subscribedProducts]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{customers.length}</Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { marginHorizontal: gutter, height: ms(48) }]}>
        <Feather name="search" size={18} color="#9A9990" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name, phone, address"
          placeholderTextColor="#9A9990"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
            <Feather name="x-circle" size={18} color="#9A9990" />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => {
          const avatar = getAvatarColor(item.user.id);
          const subCount = getSubscriptionCount(item.user.id);
          return (
            <View style={styles.card}>
              <View style={styles.cardAccent} />
              <View style={styles.cardInner}>
                 <View style={styles.cardTopRow}>
                   <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
                     <Text style={[styles.avatarText, { color: avatar.text }]}>
                       {getInitial(item.user.name)}
                     </Text>
                   </View>
                   <View style={styles.cardInfo}>
                     <Text style={styles.name} numberOfLines={1}>
                       {item.user.name}
                     </Text>
                     <Text style={styles.phone} numberOfLines={1}>
                       {item.user.phone}
                     </Text>
                     {!!item.user.address && (
                       <View style={styles.addressRow}>
                         <Feather name="map-pin" size={12} color="#888780" />
                         <Text style={styles.address} numberOfLines={2}>
                           {item.user.address}
                         </Text>
                       </View>
                     )}
                   </View>
                   <TouchableOpacity
                     style={styles.cardDeleteBtn}
                     onPress={() => handleDelete(item.user.id, item.user.name)}
                     accessibilityLabel={`Delete ${item.user.name}`}
                   >
                     <Feather name="trash-2" size={18} color="#A32D2D" />
                   </TouchableOpacity>
                 </View>
                 <View style={styles.actionsRow}>
                   <TouchableOpacity
                     style={styles.actionBtn}
                     onPress={() => handleCall(item.user.phone)}
                     accessibilityLabel={`Call ${item.user.name}`}
                   >
                     <Feather name="phone" size={16} color="#185FA5" />
                     <Text style={styles.actionBtnText}>Call</Text>
                   </TouchableOpacity>

                   <TouchableOpacity
                     style={[styles.actionBtn, styles.viewActionBtn]}
                     onPress={() =>
                       navigation.navigate("CustomerSubscriptions", {
                         customerId: item.user.id,
                         customerName: item.user.name,
                       })
                     }
                     accessibilityLabel={`View ${item.user.name} subscriptions`}
                   >
                     <Feather name="eye" size={16} color="#FFFFFF" />
                     <Text style={[styles.actionBtnText, styles.viewActionBtnText]}>
                       View
                     </Text>
                   </TouchableOpacity>
                 </View>
              </View>
            </View>
          );
        }}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name={section.title === "Subscribed Customers" ? "checkmark-circle" : "person-outline"}
                size={18}
                color={section.count > 0 ? "#2563EB" : "#9A9990"}
              />
              <Text style={[styles.sectionTitle, { color: section.count > 0 ? "#1A1A18" : "#9A9990" }]}>
                {section.title}
              </Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: section.count > 0 ? "#E6F1FB" : "#F1F0EA" }]}>
              <Text style={[styles.sectionBadgeText, { color: section.count > 0 ? "#0C447C" : "#9A9990" }]}>
                {section.count}
              </Text>
            </View>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        refreshing={loading}
        onRefresh={fetchCustomers}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: gutter, paddingBottom: ms(100), maxWidth: isTablet ? 860 : 720, width: "100%", alignSelf: "center" }]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="users" size={32} color="#B4B2A9" />
            <Text style={styles.emptyText}>No customers found.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { right: gutter, bottom: Math.max(insets.bottom, 16) + ms(20) }]}
        onPress={() => setAddModalVisible(true)}
        accessibilityLabel="Add customer"
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add customer</Text>
            <Text style={styles.modalSubtitle}>
              Enter the customer's phone number to add them.
            </Text>

            <TextInput
              placeholder="Phone number"
              placeholderTextColor="#9A9990"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
            />

            {addCustomerError ? (
              <Text style={styles.errorText}>{addCustomerError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setPhone("");
                  setAddCustomerError("");
                  setAddModalVisible(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddCustomer}
              >
                <Text style={styles.addBtnText}>Add customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CustomerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },
   listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sectionBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A18",
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: "#E6F1FB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 30,
    alignItems: "center",
  },
  headerBadgeText: {
    color: "#0C447C",
    fontWeight: "700",
    fontSize: 13,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EDEBE3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A18",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: "#F0F0EC",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#2563EB",
  },
  cardInner: {
    padding: 14,
    paddingLeft: 18,
    paddingRight: 14,
  },
  cardDeleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    marginLeft: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A18",
    marginBottom: 1,
  },
  phone: {
    fontSize: 13,
    color: "#5F5E5A",
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: "#888780",
    flex: 1,
    lineHeight: 16,
  },
  subBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  subBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  viewActionBtn: {
    backgroundColor: "#2563EB",
  },
  deleteActionBtn: {
    backgroundColor: "#FEF2F2",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  viewActionBtnText: {
    color: "#FFFFFF",
  },
  deleteActionBtnText: {
    color: "#A32D2D",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(20,20,18,0.55)",
    paddingHorizontal: 24,
  },
  modal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A18",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#5F5E5A",
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DAD8CE",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    marginBottom: 16,
    color: "#1A1A18",
  },
  errorText: {
    color: "#A32D2D",
    backgroundColor: "#FCEBEB",
    borderColor: "#F09595",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontWeight: "600",
    fontSize: 13,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1EFE8",
  },
  cancelBtnText: {
    color: "#1A1A18",
    fontWeight: "600",
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 80,
    gap: 10,
  },
  emptyText: {
    color: "#888780",
    fontSize: 15,
  },
});