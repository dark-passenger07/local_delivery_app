import { create } from "zustand"
import { axiosInstance } from "../../api/axios"
import { io, Socket } from "socket.io-client"
import { useCustomerSubscriptionStore } from "./CustomerSubscriptionContext"

interface VendorState {
  id: string
  userId: string
  businessName: string
  businessPhone: string
}


interface SubscribeProductState {
  id: string
  vendorId: string
  productName: string
  description: string
  unit: string
  vendor: VendorState
}

interface subscribeProductApiresponse {
  message: string
  success: boolean
  subscribeProduct: SubscribeProductState[]
}


interface RequestType {
  start_date: string,
  end_date: string,
  message: string,
  type: string,
  productId: string,
  requestedQuantity?: string
}


interface Request {
  id: string
  vendorCustomerId: string
  productId: string
  productName?: string
  type: string
  message: string
  start_date: string
  end_date: string
  status: string
  respondedAt: string
  createdAt: string
  updatedAt: string
  requestedQuantity?: string | null
  previousQuantity?: number | null
}

interface RequestApiResponse {
  message: string
  success: boolean
  requestStatus: Request[]
}

interface CustomerHomeState {
  getCustomerSubscribedProducts: () => Promise<void>,
  customerRequest: (credential: RequestType) => Promise<void>,
  getAllRequestCustomer: () => Promise<void>,
  cancelCustomerRequest: (id: string) => Promise<void>,
  removeRequestDetails: (id: string) => void,
  unsubcribeProduct: (id: string) => Promise<void>,
  updateRequestDetails: (updatedRequest :any)=> void
  subcribedProducts: SubscribeProductState[],
  requestDetails: Request[],
  pendingNotificationCount: number,
  addPendingNotification: () => void,
  clearPendingNotifications: () => void
}

export const useCustomerHomeContext = create<CustomerHomeState>()((set, get) => ({
  requestDetails: [],
  pendingNotificationCount: 0,
  subcribedProducts: [],
  getCustomerSubscribedProducts: async () => {
    try {
      const res = await axiosInstance.get<subscribeProductApiresponse>("/subscription/get/subscribed-product")
      if (res.data.success) {
        set({ subcribedProducts: res.data.subscribeProduct })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  customerRequest: async (credential: RequestType) => {
    try {
      await axiosInstance.post("/request/new-request", {
        start_date: credential.start_date,
        end_date: credential.end_date,
        message: credential.message,
        type: credential.type,
        productId: credential.productId,
        requestedQuantity: credential.requestedQuantity
      })
      await get().getAllRequestCustomer()
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  cancelCustomerRequest: async (id: string) => {
    try {
      await axiosInstance.delete(`/request/cancel-request/${id}`)
      set((state) => {
        const remaining = state.requestDetails.filter((request) => request.id !== id)
        return {
          requestDetails: remaining,
          pendingNotificationCount: remaining.filter(
            (request) => request.status?.toUpperCase() === "PENDING"
          ).length,
        }
      })
      await get().getAllRequestCustomer()
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  removeRequestDetails: (id: string) => {
    set((state) => {
      const remaining = state.requestDetails.filter((request) => request.id !== id)
      return {
        requestDetails: remaining,
        pendingNotificationCount: remaining.filter(
          (request) => request.status?.toUpperCase() === "PENDING"
        ).length,
      }
    })
  },
  getAllRequestCustomer: async () => {
    try {
      const res = await axiosInstance.get<RequestApiResponse>("/request/request-status")
      if (res.data.success) {
        const mapped = res.data.requestStatus.map((req: any) => ({
          ...req,
          productName: req.product?.productName || req.productName,
          requestedQuantity: req.requestedQuantity ?? null,
          previousQuantity: req.previousQuantity ?? null,
        }))
        const pendingCount = mapped.filter((req: any) => req.status?.toUpperCase() === "PENDING").length
        set({ requestDetails: mapped, pendingNotificationCount: pendingCount })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  unsubcribeProduct: async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/subscription/product/unsubscribe-product/${id}`)
      if (res.data.success) {
        await get().getCustomerSubscribedProducts()
        await useCustomerSubscriptionStore.getState().fetchMySubscriptions()
        // pending requests for this product were auto-rejected on the server —
        // refresh so they show as Rejected instead of stuck on Waiting
        await get().getAllRequestCustomer().catch(() => {})
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  updateRequestDetails: (updatedRequest: Request) => {
    const flattened = { ...updatedRequest, productName: (updatedRequest as any).product?.productName || updatedRequest.productName }
      set((state) =>({
        requestDetails: state.requestDetails.map((request) =>
          request.id == flattened.id ? flattened: request
        ),
        pendingNotificationCount: state.pendingNotificationCount + 1
      }))
      useCustomerSubscriptionStore.getState().fetchMySubscriptions().catch(() => {})
      const subscriptionId = (updatedRequest as any).subscriptionId
      if (subscriptionId) {
        useCustomerSubscriptionStore.getState().fetchCalendar(subscriptionId).catch(() => {})
      }
  },
  addPendingNotification: () => {
    set((state) => ({ pendingNotificationCount: state.pendingNotificationCount + 1 }))
  },
  clearPendingNotifications: () => {
    set({ pendingNotificationCount: 0 })
  }
}))