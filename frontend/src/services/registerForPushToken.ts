import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { axiosInstance } from "../api/axios";

export async function registerPushToken() {
  if (!Device.isDevice) return;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await axiosInstance.post("/notification/push-token", {
    token,
    platform: Platform.OS.toUpperCase(),
  });

  return token;
}

export async function unregisterPushToken() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  await axiosInstance.delete("/notification/push-token", {
    data: {
      token,
    },
  });
}