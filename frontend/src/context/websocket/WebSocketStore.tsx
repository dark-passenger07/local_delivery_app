import { create } from "zustand";
import { io, Socket } from "socket.io-client"
import { useCustomerHomeContext } from "../customerContext/CustomerHomeContext";

import { useCustomerVendorStore, VendorType } from "../customerContext/CustomerVendorContext";
import { useRequestStore } from "../vendorContext/RequestContext";
import { useCustomerSubscriptionStore } from "../vendorContext/CustomerSubscriptionContex";
interface SocketStore {
  initCustomerSocket: (userId: string) => Promise<void>
  socket: Socket | null
  disconnectSocket: () => Promise<void>
}

type newProductType = {
  id: string
  vendorId: string
  productName: string
  description: string
  vendor: VendorType
  unit: string
}

type ProductType = {
  productName: string
}

interface Request {
  id: string
  vendorCustomerId: string
  productId: string
  product: ProductType
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
  product: ProductType
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

export const useSocketStore = create<SocketStore>()((set, get) => ({
  socket: null,
  initCustomerSocket: async (userId: string) => {
    if (get().socket) return

    const socket = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: true
    })

    // connect to backend socket
    socket.on("connect", () => {
      socket.emit("join_room", userId)
    })

    socket.on("connect_error", (err) => console.log("Socket error: ", err.message))

    // show the customer vendor's updated product list
    socket.on("Updated_Product_response", (newProduct: newProductType) => {
      useCustomerVendorStore.getState().updateVendorProducts(newProduct)
    })

    // show the vendor response to customer request instantly
    socket.on("vendor_update_response", (updatedRequest: Request) => {
      useCustomerHomeContext.getState().updateRequestDetails(updatedRequest)
    })

    // when there is a new request update the vendor request section instantly
    socket.on("new_request_created", (newRequest: CustomerRequest) => {
      const mappedRequest = { ...newRequest, productName: newRequest.product?.productName }
      useRequestStore.getState().getNewRequest(mappedRequest)
    })

    // update the customer when vendor deletes their product
    socket.on("update_vendor_product", (data) => {
      const { action, productId } = data;
      if (action == "DELETE") {
        useCustomerVendorStore.getState().updateProductAfterDelete(productId);
        useCustomerHomeContext.getState().getCustomerSubscribedProducts()
      }
    })

    // when customer subscribes to a product update it to vendor instantly
    socket.on("customer_subscribed_product", (newSubscription) => {
      useCustomerSubscriptionStore.setState((state) => ({
        subscribedProducts: [newSubscription, ...state.subscribedProducts]
      }))
    })

    // when customer removes a product update it to vendor instantly
    socket.on("customer_unsubcribed_product", (productId) => {
      useCustomerSubscriptionStore.setState((state) => ({
        subscribedProducts: state.subscribedProducts.filter((p) => p?.productId != productId)
      }))
    })

    // when vendor adds a customer 
    socket.on("vendor_added_customer", (newVendor) => {
      useCustomerVendorStore.setState((state) => {
        const exists = state.vendorProfiles.some((vendor) => vendor.id === newVendor.id)
        return {
          vendorProfiles: exists ? state.vendorProfiles : [newVendor, ...state.vendorProfiles]
        }
      });
    });

    // when vendor removes the customer
    socket.on("customer_removed", (vendorId) => {
      useCustomerVendorStore.setState((state) => ({
        vendorProfiles: state.vendorProfiles.filter((vendor) => vendor.id != vendorId)
      }));

      useCustomerHomeContext.getState().getCustomerSubscribedProducts();
    })



    set({ socket });
  },

  disconnectSocket: async () => {
    const { socket } = get();

    if (socket) {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("new_request_created");
      socket.off("Updated_Product_response");
      socket.off("vendor_update_response");
      socket.off("update_vendor_product");
      socket.off("customer_subscribed_product");
      socket.off("customer_unsubcribed_product");
      socket.off("vendor_added_customer");
      socket.off("customer_removed");

      socket.disconnect(); // Closes the connection cleanly
      set({ socket: null }); // Resets the store state
      console.log("Socket disconnected cleanly.");
    }
  }
}))
