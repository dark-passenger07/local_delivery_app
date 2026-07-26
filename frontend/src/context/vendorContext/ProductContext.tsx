import { create } from "zustand"
import { axiosInstance } from "../../api/axios"

type AddProductType = {
  productName: string,
  description: string,
  unit: string
}

interface ProductState {
  allProducts: VendorProductState[]
  addProduct: (credentials: AddProductType) => Promise<void>
  removeProduct: (id: string) => Promise<void>
  getAllProducts: () => Promise<void>
}

interface VendorProductState {
  id: string
  vendorId: string,
  productName: string
  description: string
  createdAt: string
  updatedAt: string
}

interface AllProductResponse {
  message: string
  success: boolean
  allProducts: VendorProductState[]
}


export const useProductStore = create<ProductState>()((set, get) => ({
  allProducts: [],
  addProduct: async (credentials: AddProductType) => {
    try {
      const res = await axiosInstance.post("/product/add-product", {
        productName: credentials.productName,
        description: credentials.description,
        unit: credentials.unit
      })
      if (res.data.success) {
        await get().getAllProducts()
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error.message ??
        "Failed to add product";
      throw new Error(message);
    }
  },
  removeProduct: async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/product/delete-product/${id}`)
      if (res.data.success) {
        await get().getAllProducts()
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error.message ??
        "Failed to remove product";
      throw new Error(message);
    }
  },
  getAllProducts: async () => {
    try {
      const res = await axiosInstance.get<AllProductResponse>("/product/all-products")
      if (res.data.success) {
        set({ allProducts: res.data.allProducts })
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error.message ??
        "Failed to fetch products";
      throw new Error(message);
    }
  },
  
}))