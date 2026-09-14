import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useCustomerSubscriptionStore,
  type VendorRevenueItem,
} from "../../context/vendorContext/CustomerSubscriptionContex";

export default function TotalRevenueScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { totalRevenue, revenueItems, revenueLoading, fetchVendorTotalRevenue } =
    useCustomerSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRevenue();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRevenue();
    }, [])
  );

  const loadRevenue = async () => {
    try {
      await fetchVendorTotalRevenue();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load total revenue");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVendorTotalRevenue();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to refresh total revenue");
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: string | number) => `₹${Number(value ?? 0).toFixed(2)}`;

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderItem = ({ item }: { item: VendorRevenueItem }) => {
    const isStopped = item.status === "STOPPED";
    return (
      <View style={[styles.card, isStopped && styles.stoppedCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName}
            </Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customerName}
            </Text>
          </View>
          <View style={[styles.badge, isStopped ? styles.stoppedBadge : styles.activeBadge]}>
            <Text style={[styles.badgeText, isStopped ? styles.stoppedBadgeText : styles.activeBadgeText]}>
              {isStopped ? "Stopped" : "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Revenue</Text>
          <Text style={styles.revenueAmount}>{formatCurrency(item.revenue)}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Price / Unit</Text>
            <Text style={styles.metaValue}>{formatCurrency(item.price)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Delivered</Text>
            <Text style={styles.metaValue}>
              {item.deliveredQuantity} {item.productUnit}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Since</Text>
            <Text style={styles.metaValue}>{formatDate(item.startDate)}</Text>
          </View>
        </View>

        {item.upcomingPrice && item.upcomingPriceEffectiveFrom && (
          <View style={styles.upcomingPriceNote}>
            <Feather name="clock" size={14} color="#B45309" />
            <Text style={styles.upcomingPriceText}>
              New price {formatCurrency(item.upcomingPrice)} from {formatDate(item.upcomingPriceEffectiveFrom)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            navigation.navigate("CustomerSubscriptions", {
              customerId: item.customerId,
              customerName: item.customerName,
            })
          }
          activeOpacity={0.85}
        >
          <Feather name="external-link" size={16} color="#2563EB" />
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (revenueLoading && revenueItems.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading revenue…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#1A1A18" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Total Revenue</Text>
          <Text style={styles.headerSubtitle}>Earnings across all subscriptions</Text>
        </View>
      </View>

      <FlatList
        data={revenueItems}
        keyExtractor={(item) => item.subscriptionId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>All-Time Revenue</Text>
            <Text style={styles.heroAmount}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.heroSub}>
              From {revenueItems.length} {revenueItems.length === 1 ? "subscription" : "subscriptions"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="bar-chart-2" size={32} color="#B4B2A9" />
            <Text style={styles.emptyText}>No revenue yet.</Text>
            <Text style={styles.emptySubtext}>
              Revenue appears once customers subscribe to your products.
            </Text>
          </View>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6FB",
  },
  loadingText: {
    marginTop: 12,
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    flexGrow: 1,
  },
  heroCard: {
    backgroundColor: "#065F46",
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#065F46",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A7F3D0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 8,
  },
  heroSub: {
    fontSize: 13,
    color: "#D1FAE5",
    fontWeight: "600",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF1F8",
    padding: 16,
    marginBottom: 14,
  },
  stoppedCard: {
    backgroundColor: "#FAFAF9",
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  activeBadgeText: {
    color: "#15803D",
  },
  stoppedBadge: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE69D",
  },
  stoppedBadgeText: {
    color: "#92400E",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  revenueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  revenueLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#065F46",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
  },
  metaItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  upcomingPriceNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  upcomingPriceText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#92400E",
  },
  detailsButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 12,
    borderRadius: 14,
  },
  detailsButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 60,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtext: {
    color: "#888780",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
