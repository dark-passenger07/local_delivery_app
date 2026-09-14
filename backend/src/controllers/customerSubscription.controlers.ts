import { Request, Response } from "express"
import { z } from "zod"
import { db } from "../libs/db.js"
import { SubscriptionService, type CalendarDay, type SubscriptionStats } from "../services/subscription.service.js"
import { sendNotification } from "../services/notification.service.js"

const SubscriptionSchema = z.object({
  productId: z.string(),
  dailyQuantity: z.coerce.number().positive("Daily quantity must be a positive number"),
  startDate: z.coerce.date(),
  price: z.coerce.number().positive("Price must be a positive number"),
})

export const subscribeProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id as string
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required", success: false })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false })
    }

    const user = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false })
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
        message: "Vendor customer relationship not found",
        success: false,
      })
    }

    const validateBody = SubscriptionSchema.safeParse({
      productId: req.body.productId || productId,
      dailyQuantity: req.body.dailyQuantity,
      startDate: req.body.startDate,
      price: req.body.price,
    })

    if (!validateBody.success) {
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        fieldErrors: validateBody.error.flatten().fieldErrors,
      })
    }

    const { dailyQuantity, startDate, price } = validateBody.data

    // Normalize to local midnight so the seeded price row lines up with the
    // midday-anchored comparisons used when pricing revenue. `startDate` arrives
    // as a date-only string, which parses to UTC midnight — in any timezone east
    // of UTC that lands mid-morning of the same local day, and west of UTC it
    // lands on the previous local day.
    const priceEffectiveFrom = new Date(startDate)
    priceEffectiveFrom.setHours(0, 0, 0, 0)

    const activeSubscription = await db.customerSubscription.findFirst({
      where: {
        vendorCustomerId: vendorCustomer.id,
        productId: productId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (activeSubscription) {
      return res.status(400).json({
        message: "You are already subscribed to this product.",
        success: false,
      })
    }

    // A previously stopped subscription is preserved as its own (STOPPED) record,
    // so a new active subscription is created without overwriting its history.
    const newSubscription = await db.customerSubscription.create({
      data: {
        vendorCustomerId: vendorCustomer.id,
        productId,
        dailyQuantity: dailyQuantity.toString(),
        price: price.toString(),
        startDate,
        // Seed price history with the subscribe-time price so later vendor
        // price changes are layered on top of a known starting point.
        prices: {
          create: {
            price: price.toString(),
            effectiveFrom: priceEffectiveFrom,
          },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            description: true,
            unit: true,
          },
        },
        vendorCustomers: {
          include: {
            user: true
          }
        }
      },
    })

    const vendorData = await db.vendor.findUnique({
      where: {
        id: product.vendorId
      }
    })

    if (!vendorData) {
      return res.status(404).json({
        message: "Can't fetch the vendor data to send notification!",
        success: false
      })
    }

    // send notiifcation to the vendor that a customer has subscribed to his product
    await sendNotification(
      vendorData.userId,
      `🎉 New Subscriber!`,
      `${user.name} just subscribed to your product, ${product.productName}.`
    );


    req.io.to(product.vendorId).emit("customer_subscribed_product", newSubscription)

    return res.status(201).json({
      message: "Subscribed to the product successfully!",
      success: true,
      subscription: newSubscription,
    })
  } catch (error: any) {
    console.log("Error while subscribing to the product: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const unsubscribeProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id as string
    if (!productId) {
      return res.status(404).json({
        message: "Product id is empty!",
        success: false,
      })
    }

    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({
        message: "Product doesn't exist!",
        success: false,
      })
    }

    const user = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false })
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
        message: "Vendor Customer doesn't exist",
        success: false,
      })
    }

    const subscription = await db.customerSubscription.findFirst({
      where: {
        vendorCustomerId: vendorCustomer.id,
        productId,
        status: "ACTIVE",
      },
    })

    if (!subscription) {
      return res.status(404).json({
        message: "No active subscription found for this product!",
        success: false,
      })
    }

    const endDate = new Date()

    const startDay = new Date(subscription.startDate)
    startDay.setHours(0, 0, 0, 0)
    const endDay = new Date(endDate)
    endDay.setHours(0, 0, 0, 0)
    const durationDays = Math.max(1, Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1)

    const [customer, vendorRecord] = await Promise.all([
      db.user.findUnique({
        where: { id: vendorCustomer.customerId },
        select: { name: true },
      }),
      db.vendor.findUnique({
        where: { id: product.vendorId },
        select: { businessName: true },
      }),
    ])

    await db.customerSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: "STOPPED",
        endDate,
      },
    })

    // Preserve a historical record of the completed/stopped subscription for the vendor.
    await db.subscriptionHistory.create({
      data: {
        subscriptionId: subscription.id,
        customerId: vendorCustomer.customerId,
        customerName: customer?.name ?? "Unknown",
        productId,
        productName: product.productName,
        vendorId: product.vendorId,
        vendorName: vendorRecord?.businessName ?? "",
        startDate: subscription.startDate,
        endDate,
        durationDays,
        status: "STOPPED",
      },
    })

    req.io.to(product.vendorId).emit("customer_unsubcribed_product", {
      ...subscription,
      status: "STOPPED",
      endDate,
    })

    const vendor = await db.vendor.findUnique({
      where: {
        id: product.vendorId
      }
    })

    // fetch the vendor details to get the vendor profile data
    // so that we can send notification to the vendor
    if (!vendor) {
      return res.status(404).json({
        message: "Can't fetch the vendor data to send notification!",
        success: false
      })
    }

    //send notificatio to the vendor
    await sendNotification(
      vendor.userId,
      `Subscription Deactivated: ${product.productName}`,
      `${user.name} has deactivated their subscription to your product, ${product.productName}.`
    );


    return res.status(200).json({
      message: "Product removed from subscription!",
      success: true,
    })
  } catch (error: any) {
    console.log("Error while removing subscribed product: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getMySubscriptions = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false })
    }

    const subscriptions = await SubscriptionService.getCustomerSubscriptions(user.id)
    const stats: SubscriptionStats[] = []
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    for (const subscription of subscriptions) {
      const subscriptionStats = await SubscriptionService.getSubscriptionStatsForMonth(subscription.id, currentYear, currentMonth)
      if (subscriptionStats) {
        stats.push(subscriptionStats)
      }
    }

    return res.status(200).json({
      message: "Subscriptions fetched successfully!",
      success: true,
      subscriptions: stats,
    })
  } catch (error: any) {
    console.log("Error while fetching subscriptions: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getSubscriptionCalendar = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false })
    }

    const subscriptionId = req.params.id as string
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required", success: false })
    }

    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear()

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month. Must be between 1 and 12", success: false })
    }

    const subscription = await db.customerSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        product: {
          select: {
            productName: true,
          },
        },
        vendorCustomers: {
          select: {
            customerId: true,
            vendorId: true,
          },
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }

    if (subscription.vendorCustomers.customerId !== user.id) {
      return res.status(403).json({ message: "You are not authorized to view this subscription", success: false })
    }

    const vendor = await db.vendor.findUnique({
      where: { id: subscription.vendorCustomers.vendorId },
      select: { businessName: true },
    })

    const calendar: CalendarDay[] = await SubscriptionService.getMonthlyCalendar(subscriptionId, year, month)

    return res.status(200).json({
      message: "Calendar fetched successfully!",
      success: true,
      calendar,
      month,
      year,
      productName: subscription.product.productName,
      vendorBusinessName: vendor?.businessName || '',
    })
  } catch (error: any) {
    console.log("Error while fetching calendar: ", error.message)
    if (error.message === "Subscription not found") {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const customerSubscribedProduct = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id
    if (!userId) {
      return res.status(404).json({
        message: "Please login first!",
        success: false,
      })
    }

    const subscribedProducts = await db.product.findMany({
      where: {
        subscription: {
          some: {
            status: "ACTIVE",
            vendorCustomers: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
      include: {
        vendor: true,
      },
    })

    return res.status(200).json({
      message: "Products fetched successfully!",
      success: true,
      subscribeProduct: subscribedProducts,
    })
  } catch (error: any) {
    console.log("Error while fetching subscribed products: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const vendorSubscibedProducts = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false,
      })
    }

    const subscribedProducts = await db.customerSubscription.findMany({
      where: {
        vendorCustomers: {
          vendorId: vendor.id,
        },
      },
      include: {
        product: true,
        vendorCustomers: {
          include: {
            user: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Customer subcribed products fetched successfully!",
      success: true,
      subscribedProducts,
    })
  } catch (error: any) {
    console.log("Error while fetching customer subscribed products: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getVendorCustomerSubscriptions = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false,
      })
    }

    const customerId = req.params.customerId as string
    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required",
        success: false,
      })
    }

    const subscribedProducts = await db.customerSubscription.findMany({
      where: {
        vendorCustomers: {
          vendorId: vendor.id,
          customerId,
        },
      },
      include: {
        product: true,
        vendorCustomers: {
          include: {
            user: true,
          },
        },
      },
    })

    return res.status(200).json({
      message: "Customer subscriptions fetched successfully!",
      success: true,
      subscribedProducts,
    })
  } catch (error: any) {
    console.log("Error while fetching customer subscriptions: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

const UpdatePriceSchema = z.object({
  price: z.coerce.number().positive("Price must be a positive number"),
  effectiveFrom: z.enum(["NEXT_DAY", "NEXT_MONTH"]),
})

// Vendor changes a single customer's per-unit price for one product. The change
// is never retroactive: it takes effect either from tomorrow or from the 1st of
// next month, and is stored as a dated row in the subscription's price history
// so revenue already earned at the old price is left untouched.
export const updateSubscriptionPrice = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({ message: "Vendor doesn't exist!", success: false })
    }

    const subscriptionId = req.params.id as string
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required", success: false })
    }

    const validateBody = UpdatePriceSchema.safeParse({
      price: req.body.price,
      effectiveFrom: req.body.effectiveFrom,
    })

    if (!validateBody.success) {
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        fieldErrors: validateBody.error.flatten().fieldErrors,
      })
    }

    const { price, effectiveFrom } = validateBody.data

    const subscription = await db.customerSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        product: { select: { productName: true } },
        vendorCustomers: { select: { vendorId: true, customerId: true } },
      },
    })

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }

    if (subscription.vendorCustomers.vendorId !== vendor.id) {
      return res.status(403).json({
        message: "You are not authorized to update this subscription",
        success: false,
      })
    }

    if (subscription.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Only active subscriptions can have their price updated.",
        success: false,
      })
    }

    // Resolve the effective date at local midnight.
    const effectiveDate = new Date()
    effectiveDate.setHours(0, 0, 0, 0)
    if (effectiveFrom === "NEXT_DAY") {
      effectiveDate.setDate(effectiveDate.getDate() + 1)
    } else {
      // First day of next month.
      effectiveDate.setMonth(effectiveDate.getMonth() + 1, 1)
    }

    // Upsert so re-scheduling a change for the same date replaces it rather
    // than stacking duplicate rows (guarded by @@unique on subscriptionId +
    // effectiveFrom).
    const priceRow = await db.subscriptionPrice.upsert({
      where: {
        subscriptionId_effectiveFrom: {
          subscriptionId,
          effectiveFrom: effectiveDate,
        },
      },
      update: { price: price.toString() },
      create: {
        subscriptionId,
        price: price.toString(),
        effectiveFrom: effectiveDate,
      },
    })

    // Notify the customer so a price change is never a surprise on their bill.
    const formattedDate = effectiveDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    await sendNotification(
      subscription.vendorCustomers.customerId,
      `Price updated: ${subscription.product.productName}`,
      `${vendor.businessName} set a new price of ₹${price} per unit, effective ${formattedDate}.`
    )

    return res.status(200).json({
      message: "Price updated successfully!",
      success: true,
      price: priceRow.price.toString(),
      effectiveFrom: priceRow.effectiveFrom.toISOString(),
    })
  } catch (error: any) {
    console.log("Error while updating subscription price: ", error.message)
    return res.status(500).json({ message: "Internal Server Error", success: false })
  }
}

// Permanently remove an unsubscribed (STOPPED) subscription record. Vendors use
// this to clean up a customer's finished subscriptions after settling payment.
// Deleting the subscription also removes its Requests and SubscriptionHistory
// rows via onDelete: Cascade, and drops it from the vendor's Total Revenue.
export const deleteStoppedSubscription = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({ message: "Vendor doesn't exist!", success: false })
    }

    const subscriptionId = req.params.id as string
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required", success: false })
    }

    const subscription = await db.customerSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        vendorCustomers: {
          select: { vendorId: true },
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }

    // Ownership: a vendor may only delete subscriptions that belong to them.
    if (subscription.vendorCustomers.vendorId !== vendor.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this subscription",
        success: false,
      })
    }

    // Guardrail: only unsubscribed (STOPPED) subscriptions can be removed. An
    // active subscription must be unsubscribed by the customer first, so a
    // vendor can never wipe a live subscription (and its accruing revenue).
    if (subscription.status !== "STOPPED") {
      return res.status(400).json({
        message: "Only unsubscribed (stopped) subscriptions can be deleted.",
        success: false,
      })
    }

    // Hard delete. Related Requests and SubscriptionHistory rows are removed
    // automatically via onDelete: Cascade defined in the schema.
    await db.customerSubscription.delete({ where: { id: subscriptionId } })

    return res.status(200).json({
      message: "Subscription record deleted successfully!",
      success: true,
      subscriptionId,
    })
  } catch (error: any) {
    console.log("Error while deleting stopped subscription: ", error.message)
    return res.status(500).json({ message: "Internal Server Error", success: false })
  }
}

export const getVendorSubscriptionCalendar = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({ message: "Vendor doesn't exist!", success: false })
    }

    const subscriptionId = req.params.id as string
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required", success: false })
    }

    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear()

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month. Must be between 1 and 12", success: false })
    }

    const subscription = await db.customerSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        vendorCustomers: {
          select: {
            vendorId: true,
          },
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }

    if (subscription.vendorCustomers.vendorId !== vendor.id) {
      return res.status(403).json({ message: "You are not authorized to view this subscription", success: false })
    }

    const calendar: CalendarDay[] = await SubscriptionService.getMonthlyCalendar(subscriptionId, year, month)

    return res.status(200).json({
      message: "Calendar fetched successfully!",
      success: true,
      calendar,
      month,
      year,
    })
  } catch (error: any) {
    console.log("Error while fetching vendor calendar: ", error.message)
    if (error.message === "Subscription not found") {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getVendorSubscriptionStats = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({ message: "Vendor doesn't exist!", success: false })
    }

    const subscriptionId = req.params.id as string
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required", success: false })
    }

    const subscription = await db.customerSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        vendorCustomers: {
          select: {
            vendorId: true,
          },
        },
        product: {
          select: {
            productName: true,
            unit: true,
          },
        },
      },
    })

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found", success: false })
    }

    if (subscription.vendorCustomers.vendorId !== vendor.id) {
      return res.status(403).json({ message: "You are not authorized to view this subscription", success: false })
    }

    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear()

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid month. Must be between 1 and 12", success: false })
    }

    const stats = await SubscriptionService.getSubscriptionStatsForMonth(subscriptionId, year, month)

    return res.status(200).json({
      message: "Subscription stats fetched successfully!",
      success: true,
      stats,
    })
  } catch (error: any) {
    console.log("Error while fetching vendor subscription stats: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getVendorTotalRevenue = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({ message: "Vendor doesn't exist!", success: false })
    }

    const revenue = await SubscriptionService.getVendorTotalRevenue(vendor.id)

    return res.status(200).json({
      message: "Total revenue fetched successfully!",
      success: true,
      totalRevenue: revenue.totalRevenue,
      items: revenue.items,
    })
  } catch (error: any) {
    console.log("Error while fetching vendor total revenue: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const getVendorDailyDeliveryReport = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({ message: "Vendor doesn't exist!", success: false })
    }

    const dateParam = req.query.date ? String(req.query.date) : new Date().toISOString().split("T")[0]
    const reportDate = new Date(dateParam)

    if (Number.isNaN(reportDate.getTime())) {
      return res.status(400).json({ message: "Invalid date", success: false })
    }

    const report = await SubscriptionService.getVendorDailyDeliveryReport(vendor.id, reportDate)

    return res.status(200).json({
      message: "Delivery report fetched successfully!",
      success: true,
      report,
    })
  } catch (error: any) {
    console.log("Error while fetching vendor daily delivery report: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

// not important for now
export const isValidRequest = async (req: Request, res: Response) => {
  try {
    // check the subscription id with the request subscription id 

    // if the request subscription id is not found then no need to take that request as accepted request because customer has already removed that product

  } catch (error) {

  }
}

export const getVendorSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor
    if (!vendor) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false,
      })
    }

    const history = await db.subscriptionHistory.findMany({
      where: {
        vendorId: vendor.id,
      },
      orderBy: {
        endDate: "desc",
      },
    })

    return res.status(200).json({
      message: "Subscription history fetched successfully!",
      success: true,
      history,
    })
  } catch (error: any) {
    console.log("Error while fetching vendor subscription history: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}