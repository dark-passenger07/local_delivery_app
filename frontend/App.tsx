import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import "./src/libs/notifications"
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}