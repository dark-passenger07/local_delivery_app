import { Expo } from "expo-server-sdk";
import { db } from "../libs/db.js";
const expo = new Expo();
export async function sendNotification(userId, title) {
    const pushTokens = await db.pushToken.findMany({
        where: {
            userId,
        }
    });
    if (pushTokens.length == 0) {
        return;
    }
    const messages = [];
    const invalidTokens = [];
    for (const pushToken of pushTokens) {
        if (!Expo.isExpoPushToken(pushToken.token)) {
            invalidTokens.push(pushToken.token);
            continue;
        }
        messages.push({
            to: pushToken.token,
            sound: "default",
            title,
        });
        if (invalidTokens.length > 0) {
            await db.pushToken.deleteMany({
                where: {
                    token: {
                        in: invalidTokens,
                    },
                },
            });
        }
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            }
            catch (err) {
                console.error("Push Notification Error:", err);
            }
        }
    }
}
//# sourceMappingURL=notification.service.js.map