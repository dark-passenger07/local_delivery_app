// src/api/auth.api.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "../../api/axios"
import { useVendorContextStore } from "./VendorContext"
import { useSocketStore } from "../websocket/WebSocketStore";
import { registerPushToken, unregisterPushToken } from "../../services/registerForPushToken";



export type LoginTypes = {
  phone: string
}

export type SignupTypes = {
  name: string,
  phone: string,
  role: string,
  address: string
}

export type UpdateProfileTypes = {
  name?: string,
  address?: string
}

export type OtpPurpose = "SIGNUP" | "LOGIN" | "CHANGE_PHONE"

export enum RoleTypes {
  VENDOR = "VENDOR",
  CUSTOMER = "CUSTOMER"
}

type User ={
  id: string,
  name: string,
  role: RoleTypes,
  phone: string,
  address: string,
}

interface AuthApiResponse{
  message: string,
  success: boolean,
  user: User
}

interface AuthState {
  // customerUserId: string | null,
  user: User | null,
  authUser: () => Promise<any>
  login: (credentials: LoginTypes) => Promise<any>
  signup: (credentials: SignupTypes) => Promise<any>
  updateProfile: (data: UpdateProfileTypes) => Promise<any>
  logout: () => Promise<any>
  sendOtp: (phone: string, purpose: OtpPurpose) => Promise<any>
  verifyOtp: (phone: string, code: string, purpose: OtpPurpose) => Promise<any>
  resendOtp: (phone: string, purpose: OtpPurpose) => Promise<any>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // customerUserId: null,
      user: null,
      authUser: async () => {
        try {
          const res = await axiosInstance.get<AuthApiResponse>("/auth/me")
          if (res.data.user) {
            useVendorContextStore.getState().resetVendorProfile()
            set({ user: res.data.user })
            await registerPushToken();
          }
          return res.data;
        } catch (error: any) {
          useVendorContextStore.getState().resetVendorProfile()
          set({ user: null }); // Reset state on error
          const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Authentication failed";
          throw new Error(message);
        }
      },
      login: async (credentials: LoginTypes) => {
        try {
          const res = await axiosInstance.post("/auth/login", {
            phone: credentials.phone
          })
          if (res.data.user) {
            useVendorContextStore.getState().resetVendorProfile()
            set({ user: res.data.user })
            await registerPushToken()
          }

          return res.data

        } catch (error: any) {
          set({ user: null }); // Reset state on error
          const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Login failed";
          throw new Error(message);
        }
      },

      signup: async (credentails: SignupTypes) => {
        try {
          const res = await axiosInstance.post("/auth/signup", {
            name: credentails.name,
            phone: credentails.phone,
            role: credentails.role,
            address: credentails.address
          })

          if (res.data.user) {
            useVendorContextStore.getState().resetVendorProfile()
            set({ user: res.data.user })

            await registerPushToken();
          }
          return res.data
        } catch (error: any) {
          set({ user: null }); // Reset state on error
          const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Signup failed";
          throw new Error(message);
        }
      },

      updateProfile: async (data: UpdateProfileTypes) => {
        try {
          const res = await axiosInstance.patch("/auth/update-profile", data)
          if (res.data.user) {
            // Only the edited fields come back; replace the cached user so the
            // profile screen reflects the change immediately. Do NOT null the
            // user on failure — a failed edit must not look like a logout.
            set({ user: res.data.user })
          }
          return res.data
        } catch (error: any) {
          const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Failed to update profile";
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await unregisterPushToken();
          const res = await axiosInstance.post("/auth/logout")
          if (res.data.success) {
            // await CookieManager.clearAll(true)
            useVendorContextStore.getState().resetVendorProfile()
            set({ user: null })
            useSocketStore.getState().disconnectSocket()
            return res.data
          }
        } catch (error: any) {
          // await CookieManager.clearAll(true)
          useVendorContextStore.getState().resetVendorProfile()
          const message = error?.response?.data?.message ?? error?.response?.data?.error ?? error.message ?? "Logout failed";
          throw new Error(message);
        } finally {
          await AsyncStorage.removeItem("auth-storage");
          useVendorContextStore.getState().resetVendorProfile()
          useSocketStore.getState().disconnectSocket()
          set({ user: null });
        }
      },

      sendOtp: async (phone: string, purpose: OtpPurpose) => {
        try {
          console.log("-------------------------")
          console.log("Phone: ", phone, "purpose: ",purpose);
          // Send OTP is an unauthenticated gateway endpoint
          const res = await axiosInstance.post("/otp/send", { phone, purpose });
          return res.data;
        } catch (error: any) {
          const message = error?.response?.data?.message ?? error.message ?? "Failed to send OTP.";
          throw new Error(message);
        }
      },

      verifyOtp: async (phone: string, code: string, purpose: OtpPurpose) => {
        try {
          const res = await axiosInstance.post("/otp/verify", { phone, code, purpose });
          return res.data;
        } catch (error: any) {
          const message = error?.response?.data?.message ?? error.message ?? "OTP Verification failed.";
          throw new Error(message);
        }
      },

      resendOtp: async (phone: string, purpose: OtpPurpose) => {
        try {
          const res = await axiosInstance.post("/otp/resend", { phone, purpose });
          return res.data;
        } catch (error: any) {
          const message = error?.response?.data?.message ?? error.message ?? "Failed to resend OTP.";
          throw new Error(message);
        }
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage), // Tells Zustand to use device disk space
    }
  ))
