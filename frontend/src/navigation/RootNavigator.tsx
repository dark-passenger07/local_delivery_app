import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native"; // Added for loading state
import { useAuthStore } from "../context/vendorContext/AuthContext";
import AuthNavigation from "./AuthNavigator";
import CustomerTabNavigator from "./CustomerNavigator";
import VendorTabNavigator from "./VendorNavigator";
import VendorSetUpScreen from "../screens/vendor/VendorSetUpScreen";
import { useVendorContextStore } from "../context/vendorContext/VendorContext";

import { useSocketStore } from "../context/websocket/WebSocketStore";

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const hasVendorProfile = useVendorContextStore((state) => state.hasVendorProfile);
  const checkVendorProfileStatus = useVendorContextStore((state) => state.isCreatedVendorProfile);
  const resetVendorProfile = useVendorContextStore((state) => state.resetVendorProfile);
  

  // Loading state to prevent rendering the wrong navigator before the API responds
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVendorProfile = async () => {
      setIsLoading(true);

      if (!user) {
        resetVendorProfile();
        setIsLoading(false);
        return;
      }

      if (user.role !== "VENDOR") {
        resetVendorProfile();
        useSocketStore.getState().initCustomerSocket(user.id)
        setIsLoading(false);
        return;
      }

      resetVendorProfile();

      try {
        // Pass the actual logged in user's ID to your endpoint
        await checkVendorProfileStatus();
      } catch (error) {
        // console.error("Failed to check profile:", error);
      }
      setIsLoading(false);
    };

    checkVendorProfile();
    // Depend ONLY on user.id so it triggers once when a user logs in
  }, [user?.id]);

  // Unauthenticated users
  if (!user) {
    return <AuthNavigation />;
  }

  // Loading state wrapper (shows spinner while checking API)
  if (user.role === "VENDOR" && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  //Customers
  if (user.role === "CUSTOMER") {
    return <CustomerTabNavigator />;
  }

  //Vendors without a profile (Fixed: Added missing return statement)
  if (user.role === "VENDOR" && !hasVendorProfile) {
    return <VendorSetUpScreen />;
  }

  return <VendorTabNavigator />;
}
