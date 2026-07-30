import { Request, Response } from "express"
import { z } from "zod"
import { db } from "../libs/db.js"
import type { Requests } from "../generated/zod/index.js"
import { sendNotification } from "../services/notification.service.js"

const RequestSchema = z.object({
  type: z.enum(["NOTE", "SKIP", "INCREASE", "DECREASE"]),
  message: z.string().min(2, { message: "Message should be at least 2 characters" }),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  productId: z.string(),
  requestedQuantity: z.coerce.number().positive().nullable().optional(),
})

export const customerRequest = async (req: Request, res: Response) => {
  try {
    const validateBody = RequestSchema.safeParse(req.body)

    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      })
    }

    const { productId, message, type, start_date, end_date, requestedQuantity } = validateBody.data

    const product = await db.product.findUnique({ where: { id: productId }, include:{
      subscription: true
    } })


    if (!product) {
      return res.status(404).json({ message: "Product doesn't exist!", success: false })
    }

    const user = req.user
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      })
    }

    if (type === "INCREASE" || type === "DECREASE") {
      if (requestedQuantity === null || requestedQuantity === undefined) {
        return res.status(400).json({
          message: "requestedQuantity is required for INCREASE and DECREASE requests",
          success: false,
        })
      }
    }

    const vendorCustomer = await db.vendorCustomers.findUnique({
      where: {
        vendorId_customerId: {
          vendorId: product.vendorId,
          customerId: user.id,
        },
      },
    })

    if (!vendorCustomer) {
      return res.status(404).json({
        message: "Vendor customer doesn't exist!",
        success: false,
      })
    }

    const newRequest = await db.requests.create({
      data: {
        vendorCustomerId: vendorCustomer.id,
        productId: product.id,
        subscriptionId: product.subscription[0].id,
        message,
        start_date,
        end_date,
        type,
        requestedQuantity: requestedQuantity !== undefined && requestedQuantity !== null
          ? requestedQuantity.toString()
          : null,
      },
      include: {
        vendorCustomers: {
          select: {
            user: true,
          },
        },
        product: true
      },
    })

    if (!newRequest) {
      return res.status(500).json({
        message: "Something went wrong while creating request!",
        success: false,
      })
    }

    if (product.vendorId) {
      req.io.to(product.vendorId).emit("new_request_created", newRequest)
    }

    const vendor = await db.vendor.findUnique({
      where:{
        id: product.vendorId
      }
    })

    if(!vendor){
      return res.status(404).json({
        message: "Vendor profile is not valid!",
        success: false
      })
    }

    await sendNotification(vendor?.userId,`${user.name} has requested`, `Customer has a request for ${product.productName} product`)

    return res.status(201).json({
      message: "Request added successfully!",
      success: true,
      requestDetails: newRequest,
    })
  } catch (error: any) {
    console.log("Error while creating request: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getCustomerRequests = async (req: Request, res: Response) => {
  try {
    const vendorId = req?.vendor?.id
    if (!vendorId) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false,
      })
    }

    const requests = await db.requests.findMany({
      where: {
        vendorCustomers: {
          vendorId,
        },
      },
      include: {
        vendorCustomers: {
          select: {
            user: true,
          },
        },
        product: {
          select: {
            productName: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Requests fetched successfully!",
      success: true,
      requests,
    })
  } catch (error: any) {
    console.log("Error getting the customer requests: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const vendorResponse = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.id as string
    if (!requestId) {
      return res.status(404).json({
        message: "Can't get the request id!",
        success: false,
      })
    }

    const request = await db.requests.findUnique({
      where: {
        id: requestId,
      },
      include: {
        vendorCustomers: {
          select: {
            user: true,
          },
        },
      },
    })

    if (!request) {
      return res.status(404).json({
        message: "No request available!",
        success: false,
      })
    }

    const requestData = z.object({
      status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
    })

    const validateBody = requestData.safeParse(req.body)
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      })
    }

    const { status } = validateBody.data
    const updatedRequest = await db.requests.update({
      where: { id: requestId },
      data: {
        status,
        respondedAt: new Date(),
      },
      include: {
        product: {
          select: {
            productName: true,
          },
        },
      },
    })

    if (!updatedRequest) {
      return res.status(500).json({
        message: "Something went wrong while updated the request!",
        success: false,
      })
    }
    console.log("UpdatedRequest: ", updatedRequest)
    const userId = request.vendorCustomers.user.id
    if (userId) {
      req.io.to(userId).emit("vendor_update_response", updatedRequest)
    }

    const vendorName = req.vendor?.businessName;
    const productName = updatedRequest.product?.productName

    if (status === "ACCEPTED" && userId) {
      try {
        await sendNotification(userId, "Request Accepted", `${vendorName} accepted your ${productName} request`)
      } catch (notifError: any) {
        console.log("Error sending push notification for accepted request: ", notifError.message)
      }
    } else if (status === "REJECTED" && userId) {
      try {
        await sendNotification(userId, "Request Rejected", `${vendorName} rejected your ${productName} request`)
      } catch (notifError: any) {
        console.log("Error sending push notification for rejected request: ", notifError.message)
      }
    }

    return res.status(200).json({
      message: "Updated request successfully!",
      success: true,
      updatedRequest,
    })
  } catch (error: any) {
    console.log("Error updating the customer request: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const customerRequestStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      })
    }

    const requestStatus = await db.requests.findMany({
      where: {
        vendorCustomers: {
          customerId: user.id,
        },
      },
      include: {
        product: {
          select: {
            productName: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Requests fetched successfully!",
      success: true,
      requestStatus,
    })
  } catch (error: any) {
    console.log("Error fetching the customer request status: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}
