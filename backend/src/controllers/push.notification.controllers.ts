import { Request, Response } from "express"
import { db } from "../libs/db.js"
import { PushTokenSchema } from "../generated/zod/index.js"
import { sendNotification } from "../services/notification.service.js"

const pushNotificationDetails = PushTokenSchema.omit({
  createdAt: true,
  id: true,
  userId: true,
})

export const savePushTokenController = async (req: Request, res: Response) => {
  try {
    const validateBody = pushNotificationDetails.safeParse(req.body)
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }
    const { platform, token } = validateBody.data;
    console.log("------------------------------")
    console.log("body data inside of savePushTokencontroller: ", validateBody.data)
    if (!req.user) {
      return res.status(404).json({
        message: "Please Login!",
        success: false
      })
    }
    const userId = req.user.id
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
    })

    return res.status(200).json({
      success: true,
      message: "Push token saved successfully",
    });

  } catch (error: any) {
    console.log("Error while fetching vendor subscription stats: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const deletePushNotificationToken = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        message: "User doesn't exist!",
        success: false
      })
    }
    const userId = req.user.id
    const { token } = req.body;

    console.log("------------------------------")
    console.log("body data inside of delete push token: ",req.body)

    if (!token) {
      return res.status(404).json({
        message: "Push token doesn't exist!",
        success: false
      })
    }
    // delete the token of the logout user
    const isDeleted = await db.pushToken.deleteMany({
      where: {
        userId,
        token: token,
      },
    });

    if(isDeleted.count === 0){
      return res.status(500).json({
        message: "Unable to delete the push token!",
        success: false
      })
    }
    console.log("push token after delete: ",token)

    return res.status(200).json({
      message: "Push token deleted successfully",
      success: true,
    });

  } catch (error: any) {
    console.log("Error whole deleting push notification token: ", error.message);
    return res.status(500).json({
      message: error.message,
      success: false,
    })
  }
}






export const sendNotificationController = async (req: Request, res: Response) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        message: "userId, title, and body are required",
        success: false,
      });
    }

    await sendNotification(userId, title, body);

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error: any) {
    console.log("Error sending push notification: ", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
}