import { create } from "zustand"
import { axiosInstance } from "../../api/axios"
import type { ProductPriceHistoryEntry } from "../../components/PriceHistoryModal"

type AddProductType = {
  productName: string,
  description: string,
  unit: string,
  price: string
}

interface ProductState {
  allProducts: VendorProductState[]
  addProduct: (credentials: AddProductType) => Promise<void>
  updateProduct: (id: string, price: string) => Promise<void>
  removeProduct: (id: string) => Promise<void>
  getAllProducts: () => Promise<void>
  getProductPriceHistory: (id: string) => Promise<ProductPriceHistoryEntry[]>
}

interface VendorProductState {
  id: string
  vendorId: string,
  productName: string
  description: string
  unit: string
  // Prisma Decimal serializes to a string in JSON.
  price: string
  createdAt: string
  updatedAt: string
}

interface AllProductResponse {
  message: string
  success: boolean
  allProducts: VendorProductState[]
}

interface PriceHistoryResponse {
  message: string
  success: boolean
  priceHistory: ProductPriceHistoryEntry[]
}


export const useProductStore = create<ProductState>()((set, get) => ({
  allProducts: [],
  addProduct: async (credentials: AddProductType) => {
    try {
      const res = await axiosInstance.post("/product/add-product", {
        productName: credentials.productName,
        description: credentials.description,
        unit: credentials.unit,
        price: credentials.price
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
  updateProduct: async (id: string, price: string) => {
    try {
      const res = await axiosInstance.patch(`/product/update-product/${id}`, { price })
      if (res.data.success) {
        await get().getAllProducts()
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error.message ??
        "Failed to update product price";
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
  getProductPriceHistory: async (id: string) => {
    try {
      const res = await axiosInstance.get<PriceHistoryResponse>(`/product/price-history/${id}`)
      if (res.data.success) {
        return res.data.priceHistory
      }
      return []
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error.message ??
        "Failed to fetch price history";
      throw new Error(message);
    }
  },

}))