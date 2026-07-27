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
  unsubcribeProduct: (id: string) => Promise<void>,
  updateRequestDetails: (updatedRequest :any)=> void
  subcribedProducts: SubscribeProductState[],
  requestDetails: Request[]
}

export const useCustomerHomeContext = create<CustomerHomeState>()((set, get) => ({
  requestDetails: [],
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
  getAllRequestCustomer: async () => {
    try {
      const res = await axiosInstance.get<RequestApiResponse>("/request/request-status")
      if (res.data.success) {
        const mapped = res.data.requestStatus.map((req: any) => ({
          ...req,
          productName: req.product?.productName || req.productName,
        }))
        set({ requestDetails: mapped })
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
        )
      }))
      useCustomerSubscriptionStore.getState().fetchMySubscriptions().catch(() => {})
      const subscriptionId = (updatedRequest as any).subscriptionId
      if (subscriptionId) {
        useCustomerSubscriptionStore.getState().fetchCalendar(subscriptionId).catch(() => {})
      }
  }
}))