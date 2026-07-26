import { create } from "zustand"
import { axiosInstance } from "../../api/axios"
import { useCustomerHomeContext } from "./CustomerHomeContext"

// one api to fetch vendor profile

// one api to show the products of vendor using their id

export interface VendorType {
  id: string
  userId: string
  businessName: string
  businessPhone: string
}


interface VendorProductsTypes {
  id: string
  vendorId: string
  productName: string
  description: string
  vendor: VendorType
  unit: string
}

interface VendorProfileState {
  id: string,
  userId: string,
  businessName: string,
  businessPhone: string,
}

interface VendorProfileApiResponse {
  message: string,
  success: boolean,
  allVendorProfile: VendorProfileState[]
}

interface CustomerVendorState {

  vendorProducts: VendorProductsTypes[]
  vendorProfiles: VendorProfileState[]
  getAllVendorProducts: (vendorId: string) => Promise<void>
  getAllVendorProfile: () => Promise<void>
  subscribeProduct: (id: string, dailyQuantity: string, startDate: string) => Promise<void>
  updateVendorProducts: (newProduct: VendorProductsTypes) => void
  clearVendorProducts: () => void;
  updateProductAfterDelete: (id: string) => void
}

interface VendorProductApiResponse {
  message: string
  success: boolean
  vendorProducts: VendorProductsTypes[]
}

export const useCustomerVendorStore = create<CustomerVendorState>()((set,get) => ({
  vendorProducts: [],
  vendorProfiles: [],


  getAllVendorProducts: async (vendorId: string) => {
    try {
      const res = await axiosInstance.get<VendorProductApiResponse>(`/product/vendor-products/${vendorId}`);
      if (res.data.success) {
        set({ vendorProducts: res.data.vendorProducts })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  getAllVendorProfile: async () => {
    try {
      const res = await axiosInstance.get<VendorProfileApiResponse>("/vendor/customer/vendor-profile")
      if (res.data.success) {
        set({ vendorProfiles: res.data.allVendorProfile })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  clearVendorProducts: () => set({ vendorProducts: [] }),
  subscribeProduct: async(id: string, dailyQuantity: string, startDate: string) =>{
    try {
      const res = await axiosInstance.post(`/subscription/product/add/${id}`, {
        dailyQuantity,
        startDate
      })
      if(res.data.success){
        await useCustomerHomeContext.getState().getCustomerSubscribedProducts()
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  updateVendorProducts: (newProduct: VendorProductsTypes) =>{
    try {
      set((state)=>{
        const exists = state.vendorProducts.some((p) => p.id === newProduct.id);
        return {
          vendorProducts: exists? state.vendorProducts : [newProduct, ...state.vendorProducts]
        } 
      })
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Something went wrong";
      throw new Error(message);
    }
  },
  updateProductAfterDelete: (productId) => set((state) =>({
    vendorProducts: state.vendorProducts.filter((product) => product.id != productId)
  }))

}))