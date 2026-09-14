import { create } from "zustand"
import { axiosInstance } from "../../api/axios"

export interface VendorSubscribedProduct {
  id: string
  vendorCustomerId: string
  productId: string
  dailyQuantity: string
  price: string
  startDate: string
  endDate: string | null
  status: string
  createdAt: string
  updatedAt: string
  product: {
    id: string
    vendorId: string
    productName: string
    description: string
    unit: string
    createdAt: string
    updatedAt: string
  }
  vendorCustomers: {
    id: string
    vendorId: string
    customerId: string
    customerPhone: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      name: string
      phone: string
      address: string
      role: string
      createdAt: string
      updatedAt: string
    }
  }
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

interface VendorCalendarApiResponse {
  message: string
  success: boolean
  calendar: CalendarDayType[]
  month: number
  year: number
}

interface VendorCustomerSubscriptionsResponse {
  message: string
  success: boolean
  subscribedProducts: VendorSubscribedProduct[]
}

export interface SubscriptionHistoryItem {
  id: string
  subscriptionId: string
  customerId: string
  customerName: string
  productId: string
  productName: string
  vendorId: string
  vendorName: string
  startDate: string
  endDate: string
  durationDays: number
  status: string
  createdAt: string
  updatedAt: string
}

interface VendorSubscriptionHistoryResponse {
  message: string
  success: boolean
  history: SubscriptionHistoryItem[]
}

export interface VendorSubscriptionStats {
  monthlyDeliveredQuantity: string
  receivedDays: number
  skippedDays: number
  price: string
  /** A price the vendor scheduled that has not taken effect yet, if any. */
  upcomingPrice: string | null
  upcomingPriceEffectiveFrom: string | null
  monthlyRevenue: string
  totalRevenue: string
}

interface VendorStatsResponse {
  message: string
  success: boolean
  stats: VendorSubscriptionStats
}

export interface VendorRevenueItem {
  subscriptionId: string
  customerId: string
  customerName: string
  productName: string
  productUnit: string
  price: string
  upcomingPrice: string | null
  upcomingPriceEffectiveFrom: string | null
  deliveredQuantity: string
  revenue: string
  status: string
  startDate: string
  endDate: string | null
}

interface VendorTotalRevenueResponse {
  message: string
  success: boolean
  totalRevenue: string
  items: VendorRevenueItem[]
}

/** When a new per-unit price starts applying. */
export type PriceEffectiveFrom = "NEXT_DAY" | "NEXT_MONTH"

export interface UpdatedPriceResult {
  price: string
  effectiveFrom: string
}

interface UpdatePriceResponse {
  message: string
  success: boolean
  price: string
  effectiveFrom: string
}

interface CustomerSubscriptionState {
  subscribedProducts: VendorSubscribedProduct[];
  subscribedCustomers: () => Promise<void>;
  calendar: CalendarDayType[];
  calendarLoading: boolean;
  currentCalendarMonth: number;
  currentCalendarYear: number;
  fetchVendorCalendar: (subscriptionId: string, month?: number, year?: number) => Promise<void>;
  fetchCustomerSubscriptions: (customerId: string) => Promise<VendorSubscribedProduct[]>;
  fetchVendorSubscriptionStats: (subscriptionId: string, month?: number, year?: number) => Promise<VendorSubscriptionStats | null>;
  subscriptionHistory: SubscriptionHistoryItem[];
  fetchVendorSubscriptionHistory: () => Promise<void>;
  totalRevenue: string;
  revenueItems: VendorRevenueItem[];
  revenueLoading: boolean;
  fetchVendorTotalRevenue: () => Promise<void>;
  deleteStoppedSubscription: (subscriptionId: string) => Promise<void>;
  updateSubscriptionPrice: (subscriptionId: string, price: number, effectiveFrom: PriceEffectiveFrom) => Promise<UpdatedPriceResult>;
  error: any
}

export const useCustomerSubscriptionStore = create<CustomerSubscriptionState>()((set, get) => ({
  subscribedProducts: [],
  error: null,
  calendar: [],
  calendarLoading: false,
  currentCalendarMonth: new Date().getMonth() + 1,
  currentCalendarYear: new Date().getFullYear(),
  subscriptionHistory: [],
  totalRevenue: "0",
  revenueItems: [],
  revenueLoading: false,

  subscribedCustomers: async () => {
    try {
      const res = await axiosInstance.get("/subscription/get/customer-subcribed-product")
      if (res.data.success) {
        set({ subscribedProducts: res.data.subscribedProducts })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Login failed";
      set({ error: message });
      throw new Error(message);
    }
  },

  fetchVendorCalendar: async (subscriptionId: string, month?: number, year?: number) => {
    const now = new Date()
    const targetMonth = month ?? now.getMonth() + 1
    const targetYear = year ?? now.getFullYear()

    set({ calendarLoading: true, currentCalendarMonth: targetMonth, currentCalendarYear: targetYear })
    try {
      const res = await axiosInstance.get<VendorCalendarApiResponse>(`/subscription/vendor/calendar/${subscriptionId}`, {
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
  },

  fetchCustomerSubscriptions: async (customerId: string) => {
    try {
      const res = await axiosInstance.get<VendorCustomerSubscriptionsResponse>(`/subscription/get/vendor/customer-subscriptions/${customerId}`)
      if (res.data.success) {
        return res.data.subscribedProducts
      }
      return []
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to load customer subscriptions"
      throw new Error(message)
    }
  },

   fetchVendorSubscriptionStats: async (subscriptionId: string, month?: number, year?: number) => {
    try {
      const now = new Date()
      const targetMonth = month ?? now.getMonth() + 1
      const targetYear = year ?? now.getFullYear()
      const res = await axiosInstance.get<VendorStatsResponse>(`/subscription/vendor/stats/${subscriptionId}`, {
        params: { month: targetMonth, year: targetYear }
      })
      if (res.data.success) {
        return res.data.stats
      }
      return null
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to load subscription stats"
      throw new Error(message)
    }
  },

  fetchVendorSubscriptionHistory: async () => {
    try {
      const res = await axiosInstance.get<VendorSubscriptionHistoryResponse>("/subscription/vendor/subscription-history")
      if (res.data.success) {
        set({ subscriptionHistory: res.data.history })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to load subscription history"
      throw new Error(message)
    }
  },

  fetchVendorTotalRevenue: async () => {
    set({ revenueLoading: true })
    try {
      const res = await axiosInstance.get<VendorTotalRevenueResponse>("/subscription/vendor/total-revenue")
      if (res.data.success) {
        set({ totalRevenue: res.data.totalRevenue, revenueItems: res.data.items })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to load total revenue"
      throw new Error(message)
    } finally {
      set({ revenueLoading: false })
    }
  },

  deleteStoppedSubscription: async (subscriptionId: string) => {
    try {
      const res = await axiosInstance.delete(`/subscription/vendor/subscription/${subscriptionId}`)
      if (res.data.success) {
        // Drop the deleted subscription everywhere it may be cached so the UI is
        // immediately consistent (Total Revenue recomputes without a refetch).
        set((state) => {
          const remainingItems = state.revenueItems.filter((i) => i.subscriptionId !== subscriptionId)
          const recomputedTotal = remainingItems.reduce((sum, i) => sum + (parseFloat(i.revenue) || 0), 0)
          return {
            revenueItems: remainingItems,
            totalRevenue: recomputedTotal.toString(),
            subscribedProducts: state.subscribedProducts.filter((p) => p.id !== subscriptionId),
          }
        })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to delete subscription"
      set({ error: message })
      throw new Error(message)
    }
  },

  updateSubscriptionPrice: async (subscriptionId: string, price: number, effectiveFrom: PriceEffectiveFrom) => {
    try {
      const res = await axiosInstance.patch<UpdatePriceResponse>(
        `/subscription/vendor/subscription/${subscriptionId}/price`,
        { price, effectiveFrom }
      )
      if (!res.data.success) {
        throw new Error(res.data.message ?? "Failed to update price")
      }

      // A new price always starts tomorrow at the earliest, so it is scheduled,
      // not current — revenue already earned keeps the old price. Reflect it as
      // the upcoming price on anything cached so the UI updates without a refetch.
      set((state) => ({
        revenueItems: state.revenueItems.map((i) =>
          i.subscriptionId === subscriptionId
            ? { ...i, upcomingPrice: res.data.price, upcomingPriceEffectiveFrom: res.data.effectiveFrom }
            : i
        ),
      }))

      return { price: res.data.price, effectiveFrom: res.data.effectiveFrom }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to update price"
      set({ error: message })
      throw new Error(message)
    }
  }
}))