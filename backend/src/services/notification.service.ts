import { Expo, ExpoPushMessage } from "expo-server-sdk"
import { db } from "../libs/db.js"

const expo = new Expo();

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
) {
  const pushTokens = await db.pushToken.findMany({
    where: {
      userId,
    }
  })

  if (pushTokens.length === 0) {
    return
  }

  const messages: ExpoPushMessage[] = [];
  const invalidTokens: string[] = [];

  for (const pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken.token)) {
      invalidTokens.push(pushToken.token);
      continue;
    }

    messages.push({
      to: pushToken.token,
      sound: "default",
      title,
      body,
    });
  }

  if (invalidTokens.length > 0) {
    await db.pushToken.deleteMany({
      where: {
        token: {
          in: invalidTokens,
        },
      },
    });
  }

  if (messages.length === 0) {
    return;
  }

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("Push Notification Error:", err);
    }
  }
}