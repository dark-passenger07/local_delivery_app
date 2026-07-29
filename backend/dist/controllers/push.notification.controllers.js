import { db } from "../libs/db.js";
import { PushTokenSchema } from "../generated/zod";
const pushNotificationDetails = PushTokenSchema.omit({
    createdAt: true,
    id: true,
    userId: true,
});
export const savePushTokenController = async (req, res) => {
    try {
        const validateBody = pushNotificationDetails.safeParse(req.body);
        if (!validateBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                fieldErrors: validateBody.error.flatten().fieldErrors,
            });
        }
        const { platform, token } = validateBody.data;
        if (!req.user) {
            return res.status(404).json({
                message: "Please Login!",
                success: false
            });
        }
        const userId = req.user.id;
        await db.pushToken.upsert({
            where: {
                token,
            },
            update: {
                userId,
                platform,
            },
            create: {
                token,
                platform,
                userId
            }
        });
        return res.status(200).json({
            success: true,
            message: "Push token saved successfully",
        });
    }
    catch (error) {
        console.log("Error while fetching vendor subscription stats: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const deletePushNotificationToken = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                message: "User doesn't exist!",
                success: false
            });
        }
        const userId = req.user.id;
        const { pushToken } = req.body;
        if (!pushToken) {
            return res.status(404).json({
                message: "Push token doesn't exist!",
                success: false
            });
        }
        await db.pushToken.deleteMany({
            where: {
                userId,
                token: pushToken,
            },
        });
    }
    catch (error) {
        console.log("Error whole deleting push notification token: ", error.message);
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};
//# sourceMappingURL=push.notification.controllers.js.map