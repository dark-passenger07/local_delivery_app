import { Request, Response } from "express"
import { db } from "../libs/db.js"
import { PushTokenSchema } from "../generated/zod/index.js"

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
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(404).json({
        message: "Push token doesn't exist!",
        success: false
      })
    }
    // delete the token of the logout user
    await db.pushToken.deleteMany({
      where: {
        userId,
        token: pushToken,
      },
    });
  } catch (error: any) {
    console.log("Error whole deleting push notification token: ", error.message);
    return res.status(500).json({
      message: error.message,
      success: false,
    })
  }
}