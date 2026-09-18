import { create } from "zustand";
import { axiosInstance } from "../../api/axios";
import { useRequestStore } from "./RequestContext";
import { useSocketStore } from "../websocket/WebSocketStore";
import type { PickedImage } from "../../utils/pickImage";

type VenorProfileTypes = {
  businessName: string
  businessPhone: string
}

type UpdateVendorProfileTypes = {
  name?: string
  address?: string
  businessName?: string
  businessPhone?: string
}

interface VendorState {
  vendorAccount: any | null,
  hasVendorProfile: boolean,
  vendorProfile: (credentials: VenorProfileTypes) => Promise<any>
  updateVendorProfile: (data: UpdateVendorProfileTypes) => Promise<any>
  uploadVendorImage: (image: PickedImage) => Promise<string>
  isCreatedVendorProfile: () => Promise<boolean>
  resetVendorProfile: () => void,
  vendorProfileDetails: any | null
}


export const useVendorContextStore = create<VendorState>()((set) => ({
  vendorAccount: null,
  hasVendorProfile: false,
  vendorProfileDetails: null,
  resetVendorProfile: () => set({ vendorAccount: null, hasVendorProfile: false }),
  vendorProfile: async (credentials: VenorProfileTypes) => {
    try {
      const res = await axiosInstance.post("/vendor/create/vendor-profile", {
        businessName: credentials.businessName,
        businessPhone: credentials.businessPhone
      })

      if (res.data.profile) {
        set({ vendorAccount: res.data.profile, hasVendorProfile: true, vendorProfileDetails: res.data.profile})
      }
      return res.data

    } catch (error: any) {
      set({ vendorAccount: null, vendorProfileDetails: null }); // Reset state on error
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Login failed";
      throw new Error(message);
    }
  },

  updateVendorProfile: async (data: UpdateVendorProfileTypes) => {
    try {
      const res = await axiosInstance.patch("/vendor/update-profile", data)
      if (res.data.profile) {
        set({
          vendorAccount: res.data.profile,
          vendorProfileDetails: res.data.profile,
          hasVendorProfile: true,
        })
      }
      return res.data
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to update profile";
      throw new Error(message);
    }
  },

  uploadVendorImage: async (image: PickedImage) => {
    try {
      const formData = new FormData()
      // React Native's FormData accepts a { uri, name, type } object as the file
      // part; the platform networking layer streams the local file for us.
      formData.append("image", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any)

      const res = await axiosInstance.post("/vendor/upload-image", formData, {
        // Override the instance's default application/json so the multipart
        // boundary is generated correctly by React Native.
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data.profile) {
        set({
          vendorAccount: res.data.profile,
          vendorProfileDetails: res.data.profile,
          hasVendorProfile: true,
        })
      }
      return res.data.image as string
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to upload image";
      throw new Error(message);
    }
  },

  isCreatedVendorProfile: async () => {
    try {
      const res = await axiosInstance.get("/vendor/vendor-profile")
      if (res.data?.vendorProfile) {
        set({
          hasVendorProfile: true,
          vendorAccount: res.data.vendorProfile,
          vendorProfileDetails: res.data.vendorProfile
        })
        useSocketStore.getState().initCustomerSocket(res.data.vendorProfile.id)
        return true
      }
      set({ hasVendorProfile: false, vendorAccount: null, vendorProfileDetails: null })
      return false
    } catch (error: any) {
      set({ hasVendorProfile: false, vendorAccount: null, vendorProfileDetails: null });
      const status = error?.response?.status;
      const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Error while getting the vendor profile!";
      const err = new Error(message);
      if (status) {
        (err as any).status = status;
      }
      throw err;
    }
  }
}))