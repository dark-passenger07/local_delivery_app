import { create } from "zustand";
import { axiosInstance } from "../../api/axios";

interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
// get all request response interface
export interface CustomerRequest {
  id: string;
  vendorCustomerId: string;
  productId: string;
  productName?: string;
  type: string;
  message: string;
  start_date: string;
  end_date: string;
  requestedQuantity?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  vendorCustomers: {
    user: CustomerUser;
  };
}

// for request updation
interface UpdateResponse {
  message: string;
  success: boolean;
}

export enum Status {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}

interface RequestState {
  getNewRequest: (newRequest: CustomerRequest) => void
  customerRequests: CustomerRequest[];
  getCustomerRequests: () => Promise<void>;
  updateRequest: (id: string, status: Status) => Promise<void>;
}


interface ApiResponse {
  message: string;
  success: boolean;
  requests: CustomerRequest[];
}

export const useRequestStore = create<RequestState>()((set, get) => ({
  customerRequests: [],
  getCustomerRequests: async () => {
    try {
      const res = await axiosInstance.get<ApiResponse>("request/all-requests");
      if (res.data.success) {
        const mapped = res.data.requests.map((req: any) => ({
          ...req,
          productName: req.product?.productName || req.productName,
        }))
        set({ customerRequests: mapped })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  updateRequest: async (id: string, status: Status) => {
    try {
      const res = await axiosInstance.put<UpdateResponse>(`request/update-request/${id}`, { status })
      if (res.data.success) {
        await get().getCustomerRequests()
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error.message ??
        "Failed to update request";
      throw new Error(message);
    }
  },
  getNewRequest: (newRequest: CustomerRequest) =>{
    set((state) => ({
        customerRequests: [newRequest, ...state.customerRequests]
      }))
  }
}))

