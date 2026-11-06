import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { useCustomerSubscriptionStore, type CalendarDayType } from '../../context/customerContext/CustomerSubscriptionContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useResponsive } from '../../utils/responsive';
import { COLORS, SHADOWS } from '../../theme/tokens';

type CalendarRouteParams = {
  SubscriptionCalendar: {
    subscriptionId: string
    vendorBusinessName: string
    productName: string
  }
}

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function SubscriptionCalendarScreen() {
  const { width, isTablet, isLargeTablet, isSmallDevice, gutter, maxWidth, rf, ms, columns } = useResponsive();
  void width; void isLargeTablet; void isSmallDevice; void maxWidth; void columns;
  const route = useRoute<RouteProp<CalendarRouteParams, 'SubscriptionCalendar'>>()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const subscriptionId = route.params?.subscriptionId || ''
  const vendorBusinessName = route.params?.vendorBusinessName || 'Vendor'
  const productName = route.params?.productName || 'Product'
  const { calendar, calendarLoading, currentCalendarMonth, currentCalendarYear, fetchCalendar } = useCustomerSubscriptionStore()
  const [month, setMonth] = useState(currentCalendarMonth)
  const [year, setYear] = useState(currentCalendarYear)

  useEffect(() => {
    if (subscriptionId) {
      loadCalendar(month, year)
    }
  }, [subscriptionId])

  useFocusEffect(
    React.useCallback(() => {
      if (subscriptionId) {
        loadCalendar(month, year)
      }
    }, [subscriptionId, month, year])
  )

  const loadCalendar = async (targetMonth: number, targetYear: number) => {
    try {
      await fetchCalendar(subscriptionId, targetMonth, targetYear)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load calendar')
    }
  }

  const goToPrevMonth = () => {
    let newMonth = month - 1
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear = year - 1
    }
    setMonth(newMonth)
    setYear(newYear)
    loadCalendar(newMonth, newYear)
  }

  const goToNextMonth = () => {
    let newMonth = month + 1
    let newYear = year
    if (newMonth > 12) {
      newMonth = 1
      newYear = year + 1
    }
    setMonth(newMonth)
    setYear(newYear)
    loadCalendar(newMonth, newYear)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const monthStats = useMemo(() => {
    const deliveredDays = calendar.filter(day => day.isCurrentMonth && day.isDelivered).length
    const skippedDays = calendar.filter(day => day.isCurrentMonth && day.requestType === 'SKIP' && day.isSkipped).length
    const monthlyDeliveredQuantity = calendar
      .filter(day => day.isCurrentMonth && day.isDelivered)
      .reduce((sum, day) => sum + (parseFloat(day.quantity) || 0), 0)
      .toFixed(2)
    return { deliveredDays, skippedDays, monthlyDeliveredQuantity }
  }, [calendar])

  const getDayStyle = (item: CalendarDayType) => {
    const base = { ...styles.calendarCell, width: '13.2%' as const, margin: ms(2) };
    if (item.requestType === 'SKIP' && item.isSkipped) {
      return { ...base, backgroundColor: '#FEE2E2' }
    }
    if (item.isUpcoming && item.isCurrentMonth) {
      return { ...base, backgroundColor: '#F1F5F9' }
    }
    if (item.isBeforeStart) {
      return { ...base, backgroundColor: '#F8FAFC' }
    }
    if (item.isStoppedDay) {
      return { ...base, backgroundColor: '#F1F5F9' }
    }
    if (!item.isDelivered && item.isCurrentMonth) {
      return { ...base, backgroundColor: '#FEF3C7' }
    }
    if (item.isDelivered && item.isCurrentMonth) {
      return { ...base, backgroundColor: '#DCFCE7' }
    }
    return { ...base, backgroundColor: '#F8FAFC' }
  }

  const getDayTextStyle = (item: CalendarDayType) => {
    if (!item.isCurrentMonth) {
      return styles.dayTextOuter
    }
    if (item.isBeforeStart) {
      return styles.dayTextOuter
    }
    if (item.isStoppedDay) {
      return styles.dayTextOuter
    }
    if (item.isUpcoming) {
      return styles.dayTextUpcoming
    }
    if (item.requestType === 'SKIP' && item.isSkipped) {
      return styles.dayTextSkipped
    }
    if (!item.isDelivered) {
      return styles.dayTextPending
    }
    return styles.dayTextActive
  }

  const renderDayQuantity = (item: CalendarDayType) => {
    const qtySize = Math.max(rf(9), 9);
    if (!item.isCurrentMonth || item.isUpcoming) {
      return <Text style={[styles.dayQuantityOuter, { fontSize: qtySize }]}>{item.quantity}</Text>
    }
    if (item.isBeforeStart) {
      return <Text style={[styles.dayQuantityOuter, { fontSize: qtySize }]}>-</Text>
    }
    if (item.isStoppedDay) {
      return <Text style={[styles.dayQuantityOuter, { fontSize: qtySize }]}>-</Text>
    }
    if (item.requestType === 'SKIP' && item.isSkipped) {
      return <Text style={[styles.dayQuantitySkipped, { fontSize: qtySize }]}>{item.quantity}</Text>
    }
    if (!item.isDelivered) {
      return <Text style={[styles.dayQuantityPending, { fontSize: qtySize }]}>{item.quantity}</Text>
    }
    return <Text style={[styles.dayQuantityActive, { fontSize: qtySize }]}>{item.quantity}</Text>
  }

  const renderCell = ({ item }: { item: CalendarDayType }) => {
    const daySize = rf(12);
    if (!item.isCurrentMonth || item.isBeforeStart || item.isStoppedDay) {
      return (
        <View style={getDayStyle(item)}>
          <Text style={[getDayTextStyle(item), { fontSize: daySize }]}>{item.dayNumber}</Text>
          {renderDayQuantity(item)}
        </View>
      )
    }

    return (
      <TouchableOpacity
        style={getDayStyle(item)}
        activeOpacity={0.8}
        onPress={() => {
          if (item.isCurrentMonth && !item.isUpcoming) {
            Alert.alert(
              `${item.date}`,
              `Quantity: ${item.quantity}\nStatus: ${item.requestType ?? 'Regular'}\nDelivered: ${item.isDelivered ? 'Yes' : 'No'}`
            )
          }
        }}
      >
        <Text style={[getDayTextStyle(item), { fontSize: daySize }]}>{item.dayNumber}</Text>
        {renderDayQuantity(item)}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: ms(24) }}
        keyboardShouldPersistTaps="handled"
      >
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={[styles.backButton, { width: ms(44), height: ms(44), borderRadius: ms(22) }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { fontSize: rf(24) }]}>Delivery Calendar</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{vendorBusinessName} • {productName}</Text>
          </View>
        </View>
        <View style={[styles.monthRow, SHADOWS.card]}>
          <TouchableOpacity style={[styles.monthButton, { width: ms(44), height: ms(44), borderRadius: ms(22) }]} onPress={goToPrevMonth} activeOpacity={0.8}>
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { fontSize: rf(18) }]}>
            {monthNames[month - 1]} {year}
          </Text>
          <TouchableOpacity style={[styles.monthButton, { width: ms(44), height: ms(44), borderRadius: ms(22) }]} onPress={goToNextMonth} activeOpacity={0.8}>
            <Text style={styles.monthButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.calendarOuter, { paddingHorizontal: gutter }]}>
      <View style={[styles.calendarContainer, SHADOWS.card, { width: '100%', maxWidth: isTablet ? 680 : 520, alignSelf: 'center' }]}>
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((day) => (
            <View key={day} style={styles.weekCell}>
              <Text style={styles.weekText}>{day}</Text>
            </View>
          ))}
        </View>

        {calendarLoading ? (
          <View style={styles.calendarLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.calendarLoadingText}>Loading calendar…</Text>
          </View>
        ) : (
          <FlatList
            data={calendar}
            keyExtractor={(item) => item.date}
            renderItem={renderCell}
            numColumns={7}
            scrollEnabled={false}
            contentContainerStyle={styles.calendarGrid}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            ListEmptyComponent={
              <View style={styles.calendarEmpty}>
                <Text style={styles.calendarEmptyText}>No calendar data available.</Text>
              </View>
            }
          />
        )}
      </View>
      </View>

      <View style={[styles.statsRow, { marginHorizontal: gutter }]}>
        <View style={[styles.statItem, SHADOWS.card, { minWidth: ms(90) }]}>
          <Text style={styles.statLabel}>Monthly Delivered Qty</Text>
          <Text style={styles.statValue}>{monthStats.monthlyDeliveredQuantity}</Text>
        </View>
        <View style={[styles.statItem, SHADOWS.card, { minWidth: ms(90) }]}>
          <Text style={styles.statLabel}>Received Days</Text>
          <Text style={styles.statValue}>{monthStats.deliveredDays}</Text>
        </View>
        <View style={[styles.statItem, SHADOWS.card, { minWidth: ms(90) }]}>
          <Text style={styles.statLabel}>Skipped Days</Text>
          <Text style={styles.statValue}>{monthStats.skippedDays}</Text>
        </View>
      </View>

      <View style={[styles.legendRow, { marginHorizontal: gutter }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DCFCE7' }]} />
          <Text style={styles.legendText}>Delivered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2' }]} />
          <Text style={styles.legendText}>Skipped</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEF3C7' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F1F5F9' }]} />
          <Text style={styles.legendText}>Upcoming</Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  backButtonText: { fontSize: 22, fontWeight: '800', color: '#1A1A18', marginTop: -2 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#475569', fontWeight: '600', marginTop: 2 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEF1F8'
  },
  monthButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  monthButtonText: { fontSize: 22, fontWeight: '800', color: '#2563EB' },
  monthLabel: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF1F8',
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  calendarOuter: { width: '100%' },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEF1F8',
    padding: 12
  },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  weekText: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.3 },

  calendarGrid: { paddingBottom: 12 },
  calendarRow: { flexDirection: 'row' },
  calendarCell: {
    width: '13.2%',
    aspectRatio: 1,
    margin: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF1F8'
  },
  dayTextOuter: { fontSize: 12, fontWeight: '700', color: '#CBD5E1' },
  dayTextUpcoming: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  dayTextSkipped: { fontSize: 12, fontWeight: '700', color: '#991B1B' },
  dayTextPending: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  dayTextActive: { fontSize: 12, fontWeight: '800', color: '#0F172A' },

  dayQuantityOuter: { fontSize: 9, fontWeight: '700', color: '#CBD5E1', marginTop: 2 },
  dayQuantityUpcoming: { fontSize: 9, fontWeight: '700', color: '#64748B', marginTop: 2 },
  dayQuantitySkipped: { fontSize: 9, fontWeight: '800', color: '#991B1B', marginTop: 2 },
  dayQuantityPending: { fontSize: 9, fontWeight: '800', color: '#92400E', marginTop: 2 },
  dayQuantityActive: { fontSize: 9, fontWeight: '800', color: '#2563EB', marginTop: 2 },

  calendarLoading: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  calendarLoadingText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  calendarEmpty: { paddingVertical: 40, alignItems: 'center' },
  calendarEmptyText: { color: '#475569', fontSize: 14, fontWeight: '600' },

  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    gap: 8
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, fontWeight: '700', color: '#475569' }
})
