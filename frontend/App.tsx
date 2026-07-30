import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import "./src/libs/notifications"
import { useEffect } from "react";
import { registerPushToken } from "./src/services/registerForPushToken";
import * as Notifications from "expo-notifications";
import { handleNotificationResponse, handleNotificationReceived } from "./src/libs/notifications";

export default function App() {
  useEffect(() => {
    registerPushToken();

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
      handleNotificationReceived(notification);
    });

    return () => {
      responseListener.remove();
      receivedListener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}