import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useCustomerSubscriptionStore, type VendorSubscribedProduct, type VendorSubscriptionStats, type PriceEffectiveFrom } from "../../context/vendorContext/CustomerSubscriptionContex";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RouteParams = {
  CustomerSubscriptions: {
    customerId: string
    customerName: string
  }
}

export default function CustomerSubscriptionsScreen() {
  const route = useRoute<RouteProp<RouteParams, 'CustomerSubscriptions'>>()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { customerId, customerName } = route.params
  const { fetchCustomerSubscriptions, fetchVendorSubscriptionStats, deleteStoppedSubscription, updateSubscriptionPrice } = useCustomerSubscriptionStore()

  const [subscriptions, setSubscriptions] = useState<VendorSubscribedProduct[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, VendorSubscriptionStats>>({})
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)

  // Price-edit modal state
  const [priceTarget, setPriceTarget] = useState<VendorSubscribedProduct | null>(null)
  const [priceInput, setPriceInput] = useState("")
  const [priceTiming, setPriceTiming] = useState<PriceEffectiveFrom>("NEXT_DAY")
  const [savingPrice, setSavingPrice] = useState(false)

  useEffect(() => {
    loadSubscriptions()
  }, [customerId])

  useFocusEffect(
    React.useCallback(() => {
      loadSubscriptions()
    }, [customerId])
  )

  useEffect(() => {
    if (subscriptions.length > 0) {
      loadAllStats()
    }
  }, [subscriptions])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await fetchCustomerSubscriptions(customerId)
      setSubscriptions(data)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const loadAllStats = async () => {
    try {
      setStatsLoading(true)
      const results = await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            const now = new Date()
            const stats = await fetchVendorSubscriptionStats(sub.id, now.getMonth() + 1, now.getFullYear())
            return { id: sub.id, stats }
          } catch {
            return { id: sub.id, stats: null }
          }
        })
      )
      const map: Record<string, VendorSubscriptionStats> = {}
      for (const r of results) {
        if (r.stats) map[r.id] = r.stats
      }
      setStatsMap(map)
    } catch (error: any) {
      console.log('Failed to load stats:', error.message)
    } finally {
      setStatsLoading(false)
    }
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleDateString()
  }

  const formatCurrency = (value: string | number) => `₹${Number(value ?? 0).toFixed(2)}`

  // Deleting a stopped subscription is irreversible, so the vendor is asked to
  // confirm twice before the request is sent (matches the logout safeguard).
  const handleDeletePress = (item: VendorSubscribedProduct) => {
    Alert.alert(
      'Delete this record?',
      `Remove ${customerName}'s stopped subscription to "${item.product.productName}"? This also deletes its delivery history and removes it from your Total Revenue.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This permanently deletes the subscription record. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete',
                  style: 'destructive',
                  onPress: () => confirmDelete(item.id),
                },
              ]
            )
          },
        },
      ]
    )
  }

  const confirmDelete = async (subscriptionId: string) => {
    try {
      await deleteStoppedSubscription(subscriptionId)
      setSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionId))
      Alert.alert('Deleted', 'The subscription record has been removed.')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete the subscription record.')
    }
  }

  // Mirrors the backend: NEXT_DAY = tomorrow 00:00, NEXT_MONTH = the 1st of next month.
  // Used only to preview the date before saving; the saved date comes back from the server.
  const resolveEffectiveDate = (timing: PriceEffectiveFrom) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    if (timing === 'NEXT_DAY') {
      date.setDate(date.getDate() + 1)
    } else {
      date.setMonth(date.getMonth() + 1, 1)
    }
    return date
  }

  const formatLongDate = (date: Date) =>
    date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const openPriceModal = (item: VendorSubscribedProduct) => {
    // Prefill with the price actually in force today (stats), not the original
    // subscribe-time price stored on the row.
    const currentPrice = statsMap[item.id]?.price ?? item.price
    setPriceTarget(item)
    setPriceInput(currentPrice ? Number(currentPrice).toString() : '')
    setPriceTiming('NEXT_DAY')
  }

  const closePriceModal = () => {
    if (savingPrice) return
    setPriceTarget(null)
    setPriceInput('')
  }

  const handleSavePrice = () => {
    if (!priceTarget) return

    const parsed = parseFloat(priceInput)
    if (!priceInput.trim() || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid price', 'Enter a price greater than 0.')
      return
    }

    const effectiveDate = resolveEffectiveDate(priceTiming)
    // Confirm with the exact date so the vendor can never mistake "next month"
    // for "right now" — revenue before this date keeps the old price.
    Alert.alert(
      'Confirm new price',
      `${priceTarget.product.productName} for ${customerName} will cost ${formatCurrency(parsed)} per ${priceTarget.product.unit.toLowerCase()} starting ${formatLongDate(effectiveDate)}.\n\nDeliveries before that date keep the current price. ${customerName} will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => submitPrice(priceTarget.id, parsed, priceTiming) },
      ]
    )
  }

  const submitPrice = async (subscriptionId: string, price: number, timing: PriceEffectiveFrom) => {
    try {
      setSavingPrice(true)
      const result = await updateSubscriptionPrice(subscriptionId, price, timing)

      // Keep the card in sync without waiting for a refetch.
      setStatsMap((prev) => {
        const existing = prev[subscriptionId]
        if (!existing) return prev
        return {
          ...prev,
          [subscriptionId]: {
            ...existing,
            upcomingPrice: result.price,
            upcomingPriceEffectiveFrom: result.effectiveFrom,
          },
        }
      })

      setPriceTarget(null)
      setPriceInput('')
      Alert.alert(
        'Price scheduled',
        `The new price of ${formatCurrency(result.price)} takes effect on ${formatLongDate(new Date(result.effectiveFrom))}.`
      )
      loadSubscriptions()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update the price.')
    } finally {
      setSavingPrice(false)
    }
  }

  const getDaysUsed = (start: string, end: string | null) => {
    const startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)
    const endDate = end ? new Date(end) : new Date()
    endDate.setHours(0, 0, 0, 0)
    return Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1)
  }

  const renderSubscription = ({ item }: { item: VendorSubscribedProduct }) => {
    const stats = statsMap[item.id]
    const isStopped = item.status === "STOPPED"

    return (
      <View style={[styles.card, isStopped && styles.stoppedCard]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.productName, isStopped && styles.stoppedProductName]} numberOfLines={1}>
            {item.product.productName}
          </Text>
          <View style={styles.headerRight}>
            <View style={[styles.badge, isStopped ? styles.stoppedBadge : styles.activeBadge]}>
              <Text style={[styles.badgeText, isStopped ? styles.stoppedBadgeText : styles.activeBadgeText]}>
                {isStopped ? "Stopped" : "Active"}
              </Text>
            </View>
            {!isStopped && (
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => openPriceModal(item)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Change the price of ${item.product.productName} for ${customerName}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="edit-2" size={16} color="#2563EB" />
              </TouchableOpacity>
            )}
            {isStopped && (
              <TouchableOpacity
                style={styles.deleteIconButton}
                onPress={() => handleDeletePress(item)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.product.productName} subscription record`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="trash-2" size={18} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[styles.description, isStopped && styles.stoppedDescription]} numberOfLines={2}>
          {item.product.description}
        </Text>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Unit</Text>
            <Text style={styles.metaValue}>{item.product.unit}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Daily Qty</Text>
            <Text style={styles.metaValue}>{item.dailyQuantity}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Monthly Delivered Quantity</Text>
            <Text style={styles.metaValue}>
              {stats ? stats.monthlyDeliveredQuantity : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Started</Text>
            <Text style={styles.metaValue}>{formatDate(item.startDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Received Days</Text>
            <Text style={styles.metaValue}>{stats ? stats.receivedDays : '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Skipped Days</Text>
            <Text style={styles.metaValue}>{stats ? stats.skippedDays : '—'}</Text>
          </View>
        </View>

        {isStopped && (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Stopped On</Text>
              <Text style={styles.metaValue}>{item.endDate ? formatDate(item.endDate) : '—'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Days Used</Text>
              <Text style={styles.metaValue}>{getDaysUsed(item.startDate, item.endDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={styles.metaValue}>Stopped</Text>
            </View>
          </View>
        )}

        <View style={styles.revenueBanner}>
          <View style={styles.revenueTile}>
            <Text style={styles.revenueTileLabel}>Price / Unit</Text>
            <Text style={styles.revenueTileValue}>{formatCurrency(stats ? stats.price : item.price)}</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueTile}>
            <Text style={styles.revenueTileLabel}>This Month</Text>
            <Text style={styles.revenueTileValue}>{stats ? formatCurrency(stats.monthlyRevenue) : '—'}</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueTile}>
            <Text style={styles.revenueTileLabel}>Total</Text>
            <Text style={styles.revenueTileValueStrong}>{stats ? formatCurrency(stats.totalRevenue) : '—'}</Text>
          </View>
        </View>

        {stats?.upcomingPrice && stats.upcomingPriceEffectiveFrom && (
          <View style={styles.upcomingPriceNote}>
            <Feather name="clock" size={14} color="#B45309" />
            <Text style={styles.upcomingPriceText}>
              New price {formatCurrency(stats.upcomingPrice)} from {formatLongDate(new Date(stats.upcomingPriceEffectiveFrom))}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => navigation.navigate('VendorSubscriptionCalendar', { subscriptionId: item.id, customerName, productName: item.product.productName })}
          activeOpacity={0.8}
        >
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.calendarButtonText}>View Calendar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading && subscriptions.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading subscriptions…</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color="#1A1A18" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Subscriptions</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {customerName}
          </Text>
        </View>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="inbox" size={32} color="#B4B2A9" />
            <Text style={styles.emptyText}>No subscriptions yet.</Text>
          </View>
        }
        renderItem={renderSubscription}
      />

      <Modal
        visible={priceTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={closePriceModal}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Update price</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {priceTarget?.product.productName} · {customerName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closePriceModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>
              Price per {priceTarget?.product.unit?.toLowerCase() ?? 'unit'} (₹)
            </Text>
            <TextInput
              style={styles.priceInput}
              value={priceInput}
              onChangeText={setPriceInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#B4B2A9"
              editable={!savingPrice}
            />

            <Text style={styles.inputLabel}>Apply from</Text>
            <View style={styles.timingRow}>
              {([
                { key: 'NEXT_DAY' as PriceEffectiveFrom, title: 'From tomorrow', caption: formatLongDate(resolveEffectiveDate('NEXT_DAY')) },
                { key: 'NEXT_MONTH' as PriceEffectiveFrom, title: 'From next month', caption: formatLongDate(resolveEffectiveDate('NEXT_MONTH')) },
              ]).map((option) => {
                const selected = priceTiming === option.key
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.timingOption, selected && styles.timingOptionSelected]}
                    onPress={() => setPriceTiming(option.key)}
                    activeOpacity={0.8}
                    disabled={savingPrice}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.timingTitle, selected && styles.timingTitleSelected]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.timingCaption, selected && styles.timingCaptionSelected]}>
                      {option.caption}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text style={styles.modalHint}>
              Deliveries before the start date keep the current price, so revenue you have already earned does not change.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closePriceModal}
                activeOpacity={0.8}
                disabled={savingPrice}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, savingPrice && styles.modalSaveButtonDisabled]}
                onPress={handleSavePrice}
                activeOpacity={0.8}
                disabled={savingPrice}
              >
                {savingPrice ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save price</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
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
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  editIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },
  timingRow: {
    flexDirection: "row",
    gap: 10,
  },
  timingOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  timingOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  timingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
    textAlign: "center",
  },
  timingTitleSelected: {
    color: "#1D4ED8",
  },
  timingCaption: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 3,
    textAlign: "center",
  },
  timingCaptionSelected: {
    color: "#2563EB",
  },
  modalHint: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveButtonDisabled: {
    opacity: 0.7,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  productName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 10,
  },
  stoppedProductName: {
    color: "#64748B",
    textDecorationLine: "line-through",
  },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },
  stoppedBadge: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE69D",
  },
  stoppedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  stoppedDescription: {
    color: "#94A3B8",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF1F8",
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
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
  calendarButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  revenueBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 14,
  },
  revenueTile: {
    flex: 1,
    alignItems: "center",
  },
  revenueDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#A7F3D0",
    marginHorizontal: 4,
  },
  revenueTileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 5,
    textAlign: "center",
  },
  revenueTileValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#065F46",
    textAlign: "center",
  },
  revenueTileValueStrong: {
    fontSize: 16,
    fontWeight: "900",
    color: "#065F46",
    textAlign: "center",
  },
  calendarIcon: {
    fontSize: 16,
  },
  calendarButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
})
