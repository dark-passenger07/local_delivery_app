import { create } from "zustand";
import {io, Socket} from "socket.io-client"
import { useCustomerHomeContext } from "../customerContext/CustomerHomeContext";
import { useCustomerSubscriptionStore } from "../customerContext/CustomerSubscriptionContext";
import { useCustomerVendorStore, VendorType } from "../customerContext/CustomerVendorContext";

interface SocketStore{
  initCustomerSocket: (userId: string) => Promise<void>
  socket: Socket | null
  disconnectSocket: () => Promise<void>
}

type newProductType ={
  id: string
  vendorId: string
  productName: string
  description: string
  vendor: VendorType
  unit: string
}


export const useSocketStore = create<SocketStore>()((set, get) =>({
  socket: null,
  initCustomerSocket: async (userId: string) => {
    if (get().socket) return

    const socket = io(process.env.EXPO_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
      autoConnect: true
    })

    // connect to backend socket
    socket.on("connect",() =>{
      socket.emit("join_room",userId)
    })

    socket.on("connect_error", (err) => console.log("Socket error: ", err.message))

    socket.on("Updated_Product_response", async(newProduct: newProductType) =>{
      await useCustomerVendorStore.getState().updateVendorProducts(newProduct)
    })  

    set({ socket });
  },
  disconnectSocket: async () => {
    const { socket } = get();

    if (socket) {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("new_request_created");

      socket.disconnect(); // Closes the connection cleanly
      set({ socket: null }); // Resets the store state
      console.log("Socket disconnected cleanly.");
    }
  }
}))
