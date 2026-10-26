import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomerHomeContext } from "../../context/customerContext/CustomerHomeContext";
import { useResponsive } from "../../utils/responsive";
import { COLORS, SHADOWS } from "../../theme/tokens";

const TABS = [
  { key: "PENDING" as const, label: "Waiting", icon: "🕓" },
  { key: "APPROVED" as const, label: "Accepted", icon: "✅" },
  { key: "REJECTED" as const, label: "Rejected", icon: "✕" },
];

export default function RequestsScreen() {
  const { width, isTablet, isLargeTablet, isSmallDevice, gutter, maxWidth, rf, ms, columns } = useResponsive();
  void width; void isLargeTablet; void isSmallDevice; void maxWidth; void columns;
  const { requestDetails, getAllRequestCustomer, cancelCustomerRequest } = useCustomerHomeContext();

  // Frontend local UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Unified fetch handler wrapped in useCallback for stability
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await getAllRequestCustomer();
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [getAllRequestCustomer]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Group requests into their respective status columns using store values
  const categorizedRequests = useMemo(() => {
    return {
      PENDING: requestDetails.filter((req) => req.status?.toUpperCase() === "PENDING"),
      APPROVED: requestDetails.filter(
        (req) => req.status?.toUpperCase() === "APPROVED" || req.status?.toUpperCase() === "ACCEPTED"
      ),
      REJECTED: requestDetails.filter(
        (req) => req.status?.toUpperCase() === "REJECTED" || req.status?.toUpperCase() === "DECLINED"
      ),
    };
  }, [requestDetails]);

  // Extract active list based on selection tab
  const currentData = categorizedRequests[activeTab];

  // Helper utility to construct clean display dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  const handleCancelRequest = (id: string) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this pending request?",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel Request",
          style: "destructive",
          onPress: async () => {
            setCancellingId(id);
            try {
              await cancelCustomerRequest(id);
            } catch (err: any) {
              setError(err.message || "Failed to cancel request");
              Alert.alert("Could not cancel request", err.message || "Please try again.");
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  // Small status pill shown on every card so it's clear at a glance, even outside its tab
  const renderStatusPill = (status: string | undefined) => {
    const normalized = status?.toUpperCase();
    if (normalized === "APPROVED" || normalized === "ACCEPTED") {
      return (
        <View style={[styles.statusPill, styles.statusPillAccepted]}>
          <Text style={styles.statusPillTextAccepted}>✓ Accepted</Text>
        </View>
      );
    }
    if (normalized === "REJECTED" || normalized === "DECLINED") {
      return (
        <View style={[styles.statusPill, styles.statusPillRejected]}>
          <Text style={styles.statusPillTextRejected}>✗ Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusPill, styles.statusPillPending]}>
        <Text style={styles.statusPillTextPending}>⏳ Waiting</Text>
      </View>
    );
  };

  // Render Item component for FlatList
  const renderRequestItem = ({ item }: { item: typeof requestDetails[0] }) => {
    return (
      <View style={[styles.card, SHADOWS.card, { padding: ms(18) }]}>
        <View style={styles.requestHeader}>
          <Text style={styles.typeBadge}>{item.type}</Text>
          {renderStatusPill(item.status)}
        </View>

        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Product:</Text>
          <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.productName || "N/A"}</Text>
        </View>

        <View style={styles.requestBody}>
          {item.message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          ) : null}

          {(item.type === 'INCREASE' || item.type === 'DECREASE') && (
            <View style={styles.quantityRow}>
              {item.previousQuantity != null && (
                <View style={[styles.quantityBadge, { minWidth: ms(90) }]}>
                  <Text style={styles.quantityLabel}>Previous Qty</Text>
                  <Text style={styles.quantityValue}>{item.previousQuantity}</Text>
                </View>
              )}
              {item.requestedQuantity != null && (
                <View style={[styles.quantityBadge, styles.requestedQuantityBadge, { minWidth: ms(90) }]}>
                  <Text style={styles.quantityLabel}>Requested Qty</Text>
                  <Text style={styles.quantityValue}>{item.requestedQuantity}</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.dateContainer, { flexWrap: 'wrap' as const }]}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateText}>{formatDate(item.start_date)}</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateText}>{formatDate(item.end_date)}</Text>
            </View>
          </View>

          {item.respondedAt && (
            <Text style={styles.respondedText}>
              Vendor replied on {formatDate(item.respondedAt)}
            </Text>
          )}

          {item.status?.toUpperCase() === "PENDING" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelRequest(item.id)}
              disabled={cancellingId === item.id}
              activeOpacity={0.85}
            >
              {cancellingId === item.id ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Full-screen loading indicator for the *very first* fetch only
  if (loading && requestDetails.length === 0) {
    return (
      <SafeAreaView style={[styles.center, styles.container]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your requests…</Text>
      </SafeAreaView>
    );
  }

  // Error screen with manual retry hook handler
  if (error && requestDetails.length === 0) {
    return (
      <SafeAreaView style={[styles.center, styles.container]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequests} activeOpacity={0.85}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <Text style={[styles.headerTitle, { fontSize: rf(28) }]}>My Requests</Text>
      </View>

      {/* Dynamic Tab Navigation Menu */}
       <View style={[styles.tabBar, SHADOWS.card, { marginHorizontal: gutter }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, { fontSize: rf(11) }, activeTab === tab.key && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              <View style={[styles.tabCount, { minWidth: ms(16), height: ms(16) }, activeTab === tab.key && styles.activeTabCount]}>
                <Text style={[styles.tabCountText, { fontSize: rf(9) }, activeTab === tab.key && styles.activeTabCountText]}>
                  {categorizedRequests[tab.key].length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      {/* Requests Feed */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        style={{ width: '100%', maxWidth: isTablet ? 720 : 520, alignSelf: 'center' }}
        contentContainerStyle={[styles.listContainer, { paddingHorizontal: gutter, paddingBottom: ms(24) }]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchRequests}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No {activeTab === "PENDING" ? "waiting" : activeTab.toLowerCase()} requests right now.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#475569",
    fontSize: 16,
    fontWeight: "600",
  },
  errorIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
   tabBar: {
     flexDirection: "row",
     backgroundColor: "#FFF",
     marginHorizontal: 20,
     borderRadius: 16,
     padding: 4,
     marginBottom: 8,
     shadowColor: "#0F172A",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 8,
     elevation: 1,
   },
   tab: {
     flex: 1,
     flexDirection: "row",
     paddingVertical: 8,
     paddingHorizontal: 6,
     alignItems: "center",
     justifyContent: "center",
     borderRadius: 10,
     gap: 3,
   },
   activeTab: {
     backgroundColor: "#DBEAFE",
   },
   tabIcon: {
     fontSize: 11,
   },
   tabLabel: {
     fontSize: 11,
     color: "#64748B",
     fontWeight: "700",
   },
   activeTabLabel: {
     color: "#1D4ED8",
     fontWeight: "800",
   },
   tabCount: {
     backgroundColor: "#F1F5F9",
     borderRadius: 8,
     minWidth: 16,
     height: 16,
     alignItems: "center",
     justifyContent: "center",
     paddingHorizontal: 3,
   },
   activeTabCount: {
     backgroundColor: "#2563EB",
   },
   tabCountText: {
     fontSize: 9,
     fontWeight: "800",
     color: "#64748B",
   },
   activeTabCountText: {
     color: "#FFFFFF",
   },
  listContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEF1F8",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 12,
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
   productRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      borderRadius: 10,
      padding: 8,
      marginBottom: 10,
      flexWrap: "wrap",
      gap: 6,
    },
   productLabel: {
     fontSize: 11,
     fontWeight: "700",
     color: "#64748B",
     textTransform: "uppercase",
     letterSpacing: 0.3,
   },
   productName: {
     fontSize: 15,
     fontWeight: "700",
     color: "#0F172A",
   },
  requestBody: {
    marginTop: 2,
  },
   typeBadge: {
     alignSelf: "flex-start",
     backgroundColor: "#DBEAFE",
     color: "#1D4ED8",
     fontSize: 11,
     fontWeight: "800",
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 8,
     overflow: "hidden",
   },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillPending: {
    backgroundColor: "#FEF3C7",
  },
  statusPillAccepted: {
    backgroundColor: "#DCFCE7",
  },
  statusPillRejected: {
    backgroundColor: "#FEE2E2",
  },
  statusPillTextPending: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
  },
  statusPillTextAccepted: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
  },
  statusPillTextRejected: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B91C1C",
  },
  messageBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 21,
    fontWeight: "500",
  },
  dateContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  dateBlock: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  dateText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "700",
  },
  respondedText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 10,
    textAlign: "right",
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },
  cancelButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },
  quantityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  quantityBadge: {
    flex: 1,
    minWidth: 90,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EEF1F8",
  },
  requestedQuantityBadge: {
    backgroundColor: "#DBEAFE",
    borderColor: "#BFDBFE",
  },
  quantityLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
});