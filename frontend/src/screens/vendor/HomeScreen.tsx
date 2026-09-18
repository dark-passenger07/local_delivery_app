import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Pressable,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { generateAndDownloadReport } from "../../utils/generateReportPDF";
import { useCustomerSubscriptionStore, type SubscriptionHistoryItem } from "../../context/vendorContext/CustomerSubscriptionContex";
import { useVendorContextStore } from "../../context/vendorContext/VendorContext";
import { useProductStore } from "../../context/vendorContext/ProductContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProductSubscription {
  subscriptionId: string
  productId: string
  productName: string
  dailyQuantity: string
  startDate: string
  status: string
}

interface CustomerState {
  id: string;
  name: string;
  phone: string;
  address: string;
  products: ProductSubscription[];
}

const C = {
  bg: "#F4F6FB", card: "#FFFFFF", ink: "#0F172A", inkSoft: "#475569", inkMuted: "#94A3B8",
  primary: "#4F46E5", primarySoft: "#EEF2FF", addressBg: "#F6F8FC",
  green: "#16A34A", greenSoft: "#DCFCE7",
  orange: "#F59E0B", orangeSoft: "#FEF3C7",
  blue: "#3B82F6", blueSoft: "#DBEAFE",
  purple: "#7C3AED", purpleSoft: "#EDE9FE",
  pink: "#EC4899", pinkSoft: "#FCE7F3",
  red: "#EF4444", redSoft: "#FEE2E2",
  amber: "#D97706", amberSoft: "#FEF3C7",
};

type ChipStyle = { icon: React.ReactNode; bg: string; fg: string };
const FALLBACKS: ChipStyle[] = [
  { bg: C.primarySoft, fg: C.primary, icon: <MaterialCommunityIcons name="package-variant-closed" size={14} color={C.primary} /> },
  { bg: C.orangeSoft, fg: C.orange, icon: <MaterialCommunityIcons name="package-variant-closed" size={14} color={C.orange} /> },
  { bg: C.greenSoft, fg: C.green, icon: <MaterialCommunityIcons name="package-variant-closed" size={14} color={C.green} /> },
  { bg: C.purpleSoft, fg: C.purple, icon: <MaterialCommunityIcons name="package-variant-closed" size={14} color={C.purple} /> },
  { bg: C.pinkSoft, fg: C.pink, icon: <MaterialCommunityIcons name="package-variant-closed" size={14} color={C.pink} /> },
];
const chipForProduct = (name: string): ChipStyle => {
  const n = name.toLowerCase();
  if (n.includes("news") || n.includes("paper")) return { bg: C.orangeSoft, fg: C.orange, icon: <MaterialCommunityIcons name="newspaper-variant" size={14} color={C.orange} /> };
  if (n.includes("water")) return { bg: C.blueSoft, fg: C.blue, icon: <Ionicons name="water" size={14} color={C.blue} /> };
  if (n.includes("milk") || n.includes("dairy")) return { bg: C.purpleSoft, fg: C.purple, icon: <MaterialCommunityIcons name="bottle-tonic" size={14} color={C.purple} /> };
  if (n.includes("veg") || n.includes("sabzi") || n.includes("vegetable")) return { bg: C.greenSoft, fg: C.green, icon: <MaterialCommunityIcons name="carrot" size={14} color={C.green} /> };
  if (n.includes("gas") || n.includes("cylinder")) return { bg: C.redSoft, fg: C.red, icon: <MaterialCommunityIcons name="fire" size={14} color={C.red} /> };
  if (n.includes("bread")) return { bg: C.amberSoft, fg: C.amber, icon: <MaterialCommunityIcons name="bread-slice" size={14} color={C.amber} /> };
  if (n.includes("egg")) return { bg: C.orangeSoft, fg: C.orange, icon: <MaterialCommunityIcons name="egg" size={14} color={C.orange} /> };
  if (n.includes("fruit")) return { bg: C.pinkSoft, fg: C.pink, icon: <MaterialCommunityIcons name="fruit-cherries" size={14} color={C.pink} /> };
  const idx = Math.abs(n.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACKS.length;
  return FALLBACKS[idx];
};

const AVATARS = [
  { bg: C.blueSoft, fg: C.blue }, { bg: C.orangeSoft, fg: C.orange },
  { bg: C.greenSoft, fg: C.green }, { bg: C.purpleSoft, fg: C.purple },
  { bg: C.pinkSoft, fg: C.pink },
];
const paletteFor = (id: string) => AVATARS[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATARS.length];
const formatPhone = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  return d.length === 10 ? `${d.slice(0, 5)} ${d.slice(5)}` : p;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { subscribedProducts, subscribedCustomers, subscriptionHistory, fetchVendorSubscriptionHistory, error: storeError } = useCustomerSubscriptionStore();
  const { vendorAccount } = useVendorContextStore();
  const { allProducts, getAllProducts } = useProductStore();

  const fetchProducts = async () => {
    await getAllProducts()
  }

  const vendorCustomers = useMemo(() => {
    fetchProducts();
    const customerMap = new Map<string, CustomerState>();
    subscribedProducts.forEach((item: any) => {
      const user = item.vendorCustomers?.user;
      if (!user) return;
      if (!customerMap.has(user.id)) {
        customerMap.set(user.id, {
          id: user.id,
          name: user.name || "Anonymous",
          phone: user.phone || "No phone",
          address: user.address || "No address provided",
          products: [],
        });
      }
      const customer = customerMap.get(user.id);
      const productName = item.product?.productName;
      if (productName) {
        const alreadyExists = customer!.products.some((p) => p.subscriptionId === item.id);
        if (!alreadyExists) {
          customer!.products.push({
            subscriptionId: item.id,
            productId: item.product.id,
            productName,
            dailyQuantity: item.dailyQuantity,
            startDate: item.startDate,
            status: item.status || "ACTIVE",
          });
        }
      }
    });
    return Array.from(customerMap.values());
  }, [subscribedProducts]);

  const totalSubscriptions = useMemo(() => vendorCustomers.reduce((n, c) => n + c.products.filter((p) => p.status === "ACTIVE").length, 0), [vendorCustomers]);
  const totalProducts = useMemo(() => allProducts.length, [allProducts]);
  const [reportLoading, setReportLoading] = useState(false);

  const activeError = storeError || localError;

  const activeSubscriptionsCount = useMemo(
    () => vendorCustomers.reduce((n, c) => n + c.products.filter((p) => p.status === "ACTIVE").length, 0),
    [vendorCustomers]
  );
  const stoppedSubscriptionsCount = useMemo(
    () => vendorCustomers.reduce((n, c) => n + c.products.filter((p) => p.status === "STOPPED").length, 0),
    [vendorCustomers]
  );

  const handleFetch = async () => {
    try {
      setLocalError(null);
      await subscribedCustomers();
    } catch (err: any) {
      setLocalError(err.message || "An unexpected error occurred.");
    }
    try {
      await fetchVendorSubscriptionHistory();
    } catch (err: any) {
      console.log("Failed to load subscription history:", err.message);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      if (vendorAccount?.id) {
        setLoading(true);
        await handleFetch();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    initFetch();
  }, [vendorAccount?.id]);

  const onRefresh = useCallback(async () => {
    if (!vendorAccount?.id) return;
    setRefreshing(true);
    await handleFetch();
    setRefreshing(false);
  }, [vendorAccount?.id]);

  const generateTodayReport = useCallback(async () => {
    try {
      setReportLoading(true);
      // Get today's date in YYYY-MM-DD format from the device (local timezone)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDateString = `${year}-${month}-${day}`;

      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/subscription/vendor/daily-delivery-report?date=${todayDateString}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate report");
      }
      console.log("--------")
      console.log(JSON.stringify(data))
      const report = {
        reportDate: data.report.reportDate,
        totalDeliveries: data.report.totalDeliveries,
        totalQuantity: data.report.totalQuantity,
        deliveries: data.report.deliveries.map((item: any) => ({
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          customerAddress: item.customerAddress,
          productName: item.productName,
          baseQuantity: item.baseQuantity,
          finalQuantity: item.finalQuantity,
          requestType: item.requestType,
          requestMessage: item.requestMessage,
        })),
      };

      await generateAndDownloadReport(report);
    } catch (error: any) {
      Alert.alert("Report Failed", error.message || "Could not generate today's report.");
    } finally {
      setReportLoading(false);
    }
  }, []);

  const renderCustomerCard = ({ item }: { item: CustomerState }) => {
    const av = paletteFor(item.id);
    const callCustomer = () => {
      const digits = (item.phone || "").replace(/\D/g, "");
      if (!digits) return;
      const url = `tel:${digits}`;
      Linking.openURL(url);
    };

    const activeProducts = item.products.filter((p) => p.status === "ACTIVE");
    const stoppedProducts = item.products.filter((p) => p.status === "STOPPED");

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={[styles.avatar, { backgroundColor: av.bg }]}>
            <Text style={[styles.avatarText, { color: av.fg }]}>{(item.name?.[0] || "?").toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.customerName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
            <View style={styles.phoneRow}>
              <Ionicons name="call" size={12} color={C.inkSoft} />
              <Text style={styles.customerPhone} numberOfLines={1} ellipsizeMode="tail">{formatPhone(item.phone)}</Text>
            </View>
          </View>
          <Pressable onPress={callCustomer} style={({ pressed }) => [styles.callBtn, pressed && { transform: [{ scale: 0.95 }] }]} hitSlop={8}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {activeProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="package-variant-closed" size={13} color={C.inkMuted} />
              <Text style={styles.sectionLabel}>ACTIVE SUBSCRIPTIONS</Text>
              <View style={styles.countBubble}>
                <Text style={styles.countBubbleText}>{activeProducts.length}</Text>
              </View>
            </View>

            <View style={styles.badgesContainer}>
              {activeProducts.map((product, index) => {
                const s = chipForProduct(product.productName);
                return (
                  <View key={`${item.id}-${product.subscriptionId}-${index}`} style={[styles.badge, { backgroundColor: s.bg }]}>
                    {s.icon}
                    <Text style={[styles.badgeText, { color: s.fg }]} numberOfLines={1} ellipsizeMode="tail">{product.productName}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {stoppedProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="pause-circle" size={13} color={C.orange} />
              <Text style={styles.sectionLabel}>STOPPED SERVICES</Text>
              <View style={[styles.countBubble, { backgroundColor: C.orangeSoft }]}>
                <Text style={styles.countBubbleText}>
                  <Text style={{ color: C.orange }}>{stoppedProducts.length}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.badgesContainer}>
              {stoppedProducts.map((product, index) => (
                <View key={`${item.id}-stopped-${product.subscriptionId}-${index}`} style={[styles.badge, styles.stoppedBadge, { backgroundColor: C.redSoft }]}>
                  <MaterialCommunityIcons name="snowflake" size={14} color={C.inkMuted} />
                  <Text style={[styles.badgeText, styles.stoppedBadgeText, { color: C.inkMuted }]} numberOfLines={1} ellipsizeMode="tail">{product.productName}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {!activeProducts.length && !stoppedProducts.length && (
          <View style={styles.badgesContainer}>
            <Text style={styles.emptySubscriptionsText}>No subscriptions</Text>
          </View>
        )}

        <View style={styles.addressContainer}>
          <View style={styles.addressIconWrap}>
            <Ionicons name="location-sharp" size={16} color={C.primary} />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>Delivery Address</Text>
            <Text style={styles.addressValue} numberOfLines={2} ellipsizeMode="tail">{item.address}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getInitials = () => {
    const name = (vendorAccount as any)?.businessName || "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.headerContainer}>
        <Text style={styles.businessName}>{(vendorAccount as any)?.businessName}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.hello}>Namaste 👋</Text>
          <View style={styles.counterBadge}>
            <MaterialCommunityIcons name="account-group" size={14} color={C.primary} />
            <Text style={styles.counterText}>
              {vendorCustomers.length} {vendorCustomers.length === 1 ? "Subscriber" : "Subscribers"}
            </Text>
          </View>
        </View>
        <View style={styles.headerTitleRow}>
          <View style={[styles.headerLogo, { backgroundColor: C.primarySoft }]}>
            {(vendorAccount as any)?.image ? (
              <Image
                source={{ uri: (vendorAccount as any).image }}
                style={styles.headerLogoImage}
                accessibilityLabel="Vendor profile image"
              />
            ) : (
              <Text style={[styles.headerLogoText, { color: C.primary }]}>{getInitials()}</Text>
            )}
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
      </View>

      <View style={styles.reportBar}>
        <TouchableOpacity style={styles.reportButton} onPress={generateTodayReport} activeOpacity={0.85} disabled={reportLoading}>
          {reportLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-document-outline" size={16} color="#FFFFFF" />
              <Text style={styles.reportButtonText}>Generate Today's Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.loadingText}>Updating live records...</Text>
        </View>
      ) : activeError ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <View style={styles.errorIconBox}><Feather name="alert-triangle" size={22} color={C.red} /></View>
              <Text style={styles.errorTitle}>{activeError}</Text>
              <Text style={styles.emptyText}>Pull down to retry connection.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={vendorCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            vendorCustomers.length > 0 ? (
              <>
                 <View style={styles.statsRow}>
                    <StatChip icon={<MaterialCommunityIcons name="package-variant-closed" size={18} color={C.green} />} tone={C.greenSoft} value={String(totalSubscriptions)} label="Active" />
                    <StatChip icon={<Feather name="box" size={18} color={C.pink} />} tone={C.pinkSoft} value={String(totalProducts)} label="Products" />
                    <StatChip icon={<MaterialCommunityIcons name="history" size={18} color={C.amber} />} tone={C.amberSoft} value={String(stoppedSubscriptionsCount)} label="Stopped" />
                 </View>
                <Text style={styles.listSectionTitle}>Your Customers</Text>
              </>
            ) : null
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
          ListFooterComponent={renderHistorySection(subscriptionHistory)}
        />
      )}
    </SafeAreaView>
  );
}

function formatHistoryDate(iso: string): string {
  const date = new Date(iso)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function renderHistorySection(subscriptionHistory: SubscriptionHistoryItem[]) {
  if (subscriptionHistory.length === 0) {
    return (
      <View style={styles.historyFooter}>
        <Text style={styles.listSectionTitle}>Subscription History</Text>
        <View style={styles.historyEmpty}>
          <MaterialCommunityIcons name="history" size={26} color={C.inkMuted} />
          <Text style={styles.historyEmptyText}>No stopped or completed subscriptions yet.</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.historyFooter}>
      <Text style={styles.listSectionTitle}>Subscription History · Stopped</Text>
      {subscriptionHistory.map((item) => (
        <View key={item.id} style={styles.historyCard}>
          <View style={styles.historyCardHeader}>
            <View style={styles.historyAvatar}>
              <Text style={styles.historyAvatarText}>
                {(item.customerName?.[0] || "?").toUpperCase()}
              </Text>
            </View>
            <View style={styles.historyCardInfo}>
              <Text style={styles.historyCustomerName} numberOfLines={1} ellipsizeMode="tail">
                {item.customerName}
              </Text>
              <Text style={styles.historyProductName} numberOfLines={1} ellipsizeMode="tail">
                {item.productName}
              </Text>
            </View>
            <View style={[styles.historyBadge, { backgroundColor: C.amberSoft }]}>
              <Text style={[styles.historyBadgeText, { color: C.amber }]}>Stopped</Text>
            </View>
          </View>

          <View style={styles.historyMetaRow}>
            <View style={styles.historyMetaItem}>
              <Text style={styles.historyMetaLabel}>Started</Text>
              <Text style={styles.historyMetaValue}>{formatHistoryDate(item.startDate)}</Text>
            </View>
            <View style={styles.historyMetaItem}>
              <Text style={styles.historyMetaLabel}>Stopped</Text>
              <Text style={styles.historyMetaValue}>{formatHistoryDate(item.endDate)}</Text>
            </View>
            <View style={styles.historyMetaItem}>
              <Text style={styles.historyMetaLabel}>Days Used</Text>
              <Text style={styles.historyMetaValue}>{item.durationDays}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

function StatChip({ icon, tone, value, label }: { icon: React.ReactNode; tone: string; value: string; label: string; }) {

  return (
    <View style={styles.statChip}>
      <View style={[styles.statIconWrap, { backgroundColor: tone }]}>{icon}</View>
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  businessName: { fontSize: 15, fontWeight: "700", color: C.ink, flex: 1 },
  headerLogo: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  headerLogoText: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  headerLogoImage: { width: 36, height: 36, borderRadius: 18 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 },
  hello: { fontSize: 13, color: C.inkSoft, fontWeight: "500" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: C.ink, letterSpacing: -0.5 },
  counterBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99 },
  counterText: { fontSize: 12.5, fontWeight: "700", color: C.primary },
  reportBar: { paddingHorizontal: 20, paddingBottom: 10 },
  reportButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: C.primary, borderRadius: 14, paddingVertical: 12 },
  reportButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  statChip: {
    flex: 1, minWidth: "30%", backgroundColor: C.card, borderRadius: 16, padding: 10, flexDirection: "row", alignItems: "center",
    ...Platform.select({ ios: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 1 } }),
  },
  statIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 15, fontWeight: "800", color: C.ink, lineHeight: 17 },
  statLabel: { fontSize: 10.5, color: C.inkSoft, marginTop: 1, fontWeight: "600" },
  listSectionTitle: { fontSize: 14, fontWeight: "700", color: C.ink, marginBottom: 10, letterSpacing: -0.2 },

  listContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },
  card: {
    backgroundColor: C.card, borderRadius: 22, padding: 14, marginBottom: 12, overflow: "hidden",
    ...Platform.select({ ios: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16 }, android: { elevation: 2 } }),
  },
  cardTopRow: { flexDirection: "row", alignItems: "center" },
  cardInfo: { flex: 1, marginLeft: 12, minWidth: 0 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "800" },
  customerName: { fontSize: 16, fontWeight: "800", color: C.ink, letterSpacing: -0.3, textTransform: "capitalize" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  customerPhone: { fontSize: 12.5, color: C.inkSoft, fontWeight: "600", letterSpacing: 0.3 },
  callBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: C.green, alignItems: "center", justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: C.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 3 } }),
  },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12, marginBottom: 8 },
  sectionLabel: { fontSize: 10.5, fontWeight: "700", color: C.inkMuted, letterSpacing: 1 },
  countBubble: { marginLeft: 2, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" },
  countBubbleText: { color: C.primary, fontSize: 10, fontWeight: "800" },
  badgesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, maxWidth: "100%" },
  badgeText: { fontSize: 11.5, fontWeight: "700" },
  stoppedBadge: { opacity: 0.7 },
  stoppedBadgeText: { textDecorationLine: "line-through" },
  deleteIcon: { marginLeft: 4, padding: 2 },
  emptySubscriptionsText: { fontSize: 12, color: C.inkMuted, fontStyle: "italic" },

  addressContainer: { marginTop: 10, backgroundColor: C.addressBg, borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  addressIconWrap: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" },
  addressContent: { flex: 1, minWidth: 0 },
  addressLabel: { fontSize: 10.5, fontWeight: "700", color: C.inkMuted, letterSpacing: 0.5, marginBottom: 1 },
  addressValue: { fontSize: 13, color: C.ink, fontWeight: "600", lineHeight: 16 },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, minHeight: 320 },
  loadingText: { marginTop: 12, color: C.inkSoft, fontSize: 14, fontWeight: "500" },
  errorIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.redSoft, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  errorTitle: { fontSize: 15, fontWeight: "700", color: C.ink, marginBottom: 4 },
  errorText: { color: C.inkSoft, fontSize: 13.5, textAlign: "center", lineHeight: 20, marginBottom: 10 },
  emptyIconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.primarySoft, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.ink, marginBottom: 4 },
  emptyText: { color: C.inkMuted, fontSize: 14, fontWeight: "500", textAlign: "center" },

  historyFooter: { marginTop: 22, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#E6E9F2" },
  historyEmpty: { alignItems: "center", marginTop: 10, gap: 8, paddingVertical: 14 },
  historyEmptyText: { color: C.inkMuted, fontSize: 13.5, textAlign: "center" },
  historyCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#F0E6D2",
    ...Platform.select({ ios: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 1 } }),
  },
  historyCardHeader: { flexDirection: "row", alignItems: "center" },
  historyAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.amberSoft, alignItems: "center", justifyContent: "center" },
  historyAvatarText: { fontSize: 16, fontWeight: "800", color: C.amber },
  historyCardInfo: { flex: 1, marginLeft: 10, minWidth: 0 },
  historyCustomerName: { fontSize: 15, fontWeight: "800", color: C.ink, letterSpacing: -0.3, textTransform: "capitalize" },
  historyProductName: { fontSize: 12.5, color: C.inkSoft, fontWeight: "600", marginTop: 1 },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: "#FDE69D" },
  historyBadgeText: { fontSize: 11, fontWeight: "800" },
  historyMetaRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 12 },
  historyMetaItem: {
    flex: 1, backgroundColor: "#FBF7F0", borderRadius: 12, borderWidth: 1, borderColor: "#F0E6D2",
    padding: 10, alignItems: "center",
  },
  historyMetaLabel: { fontSize: 10.5, fontWeight: "700", color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 },
  historyMetaValue: { fontSize: 13, fontWeight: "800", color: C.ink, textAlign: "center" },
});