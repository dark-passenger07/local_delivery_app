import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useVendorCustomerStore } from "../../context/vendorContext/vendorCustomerContext";
import { useCustomerSubscriptionStore } from "../../context/vendorContext/CustomerSubscriptionContex";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [addCustomerError, setAddCustomerError] = useState("");
  const { subscribedProducts } = useCustomerSubscriptionStore();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
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

  const handleDelete = (userId: string) => {
    Alert.alert(
      "Remove customer",
      "Are you sure you want to remove this customer?",
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
  };

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getSubscriptionCount = (customerId: string) => {
    return subscribedProducts.filter(
      (sub) => sub.vendorCustomerId === customerId
    ).length;
  };

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(q) ||
        item.user?.phone?.toLowerCase().includes(q) ||
        item.user?.address?.toLowerCase().includes(q)
    );
  }, [search, customers]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{customers.length}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
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

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.user.id}
        refreshing={loading}
        onRefresh={fetchCustomers}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="users" size={32} color="#B4B2A9" />
            <Text style={styles.emptyText}>No customers found.</Text>
          </View>
        }
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
                  {subCount > 0 && (
                    <View style={styles.subBadge}>
                      <Text style={styles.subBadgeText}>{subCount}</Text>
                    </View>
                  )}
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

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteActionBtn]}
                    onPress={() => handleDelete(item.user.id)}
                    accessibilityLabel={`Delete ${item.user.name}`}
                  >
                    <Feather name="trash-2" size={16} color="#A32D2D" />
                    <Text style={[styles.actionBtnText, styles.deleteActionBtnText]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
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
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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