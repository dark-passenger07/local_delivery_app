import { create } from "zustand"
import { axiosInstance } from "../../api/axios"

export interface SubscriptionStatsType {
  subscriptionId: string
  productName: string
  productUnit: string
  dailyQuantity: string
  startDate: string
  receivedDays: number
  skippedDays: number
  currentDailyQuantity: string
  upcomingRequests: number
  monthlyDeliveredQuantity: string
  vendorBusinessName: string
  price: string
  /** A new price the vendor scheduled that has not started applying yet. */
  upcomingPrice: string | null
  upcomingPriceEffectiveFrom: string | null
  monthlyRevenue: string
  totalRevenue: string
}

export interface CalendarDayType {
  date: string
  dayNumber: number
  monthNumber: number
  year: number
  isCurrentMonth: boolean
  quantity: string
  isDelivered: boolean
  isSkipped: boolean
  isUpcoming: boolean
  requestType: string | null
  requestId: string | null
  isBeforeStart: boolean
  isStoppedDay: boolean
}

interface SubscriptionApiResponse {
  message: string
  success: boolean
  subscriptions: SubscriptionStatsType[]
}

interface CalendarApiResponse {
  message: string
  success: boolean
  calendar: CalendarDayType[]
  month: number
  year: number
}

interface CustomerSubscriptionState {
  subscriptions: SubscriptionStatsType[]
  calendar: CalendarDayType[]
  loading: boolean
  calendarLoading: boolean
  currentCalendarMonth: number
  currentCalendarYear: number
  fetchMySubscriptions: () => Promise<void>
  fetchCalendar: (subscriptionId: string, month?: number, year?: number) => Promise<void>
}

export const useCustomerSubscriptionStore = create<CustomerSubscriptionState>()((set, get) => ({
  subscriptions: [],
  calendar: [],
  loading: false,
  calendarLoading: false,
  currentCalendarMonth: new Date().getMonth() + 1,
  currentCalendarYear: new Date().getFullYear(),

  fetchMySubscriptions: async () => {
    set({ loading: true })
    try {
      const res = await axiosInstance.get<SubscriptionApiResponse>("/subscription/my-subscriptions")
      if (res.data.success) {
        set({ subscriptions: res.data.subscriptions })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to load subscriptions"
      throw new Error(message)
    } finally {
      set({ loading: false })
    }
  },

  fetchCalendar: async (subscriptionId: string, month?: number, year?: number) => {
    const now = new Date()
    const targetMonth = month ?? now.getMonth() + 1
    const targetYear = year ?? now.getFullYear()

    set({ calendarLoading: true, currentCalendarMonth: targetMonth, currentCalendarYear: targetYear })
    try {
      const res = await axiosInstance.get<CalendarApiResponse>(`/subscription/calendar/${subscriptionId}`, {
        params: { month: targetMonth, year: targetYear }
      })
      if (res.data.success) {
        set({ calendar: res.data.calendar })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to load calendar"
      throw new Error(message)
    } finally {
      set({ calendarLoading: false })
    }
  }
}))
