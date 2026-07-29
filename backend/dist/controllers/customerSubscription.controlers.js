import { z } from "zod";
import { db } from "../libs/db.js";
import { SubscriptionService } from "../services/subscription.service.js";
import { sendNotification } from "../services/notification.service.js";
const SubscriptionSchema = z.object({
    productId: z.string(),
    dailyQuantity: z.coerce.number().positive("Daily quantity must be a positive number"),
    startDate: z.coerce.date(),
});
export const subscribeProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required", success: false });
        }
        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false });
        }
        const vendorCustomer = await db.vendorCustomers.findUnique({
            where: {
                vendorId_customerId: {
                    vendorId: product.vendorId,
                    customerId: user.id,
                },
            },
        });
        if (!vendorCustomer) {
            return res.status(404).json({
                message: "Vendor customer relationship not found",
                success: false,
            });
        }
        const existingSubscription = await db.customerSubscription.findUnique({
            where: {
                vendorCustomerId_productId: {
                    vendorCustomerId: vendorCustomer.id,
                    productId: productId,
                },
            },
        });
        if (existingSubscription) {
            return res.status(400).json({
                message: "You are already subscribed to this product.",
                success: false,
            });
        }
        const validateBody = SubscriptionSchema.safeParse({
            productId: req.body.productId || productId,
            dailyQuantity: req.body.dailyQuantity,
            startDate: req.body.startDate,
        });
        if (!validateBody.success) {
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                fieldErrors: validateBody.error.flatten().fieldErrors,
            });
        }
        const { dailyQuantity, startDate } = validateBody.data;
        const newSubscription = await db.customerSubscription.create({
            data: {
                vendorCustomerId: vendorCustomer.id,
                productId,
                dailyQuantity: dailyQuantity.toString(),
                startDate,
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
        });
        await sendNotification(product.vendorId, `A customer ${user.name} has subscribed to your ${product.productName} product`);
        req.io.to(product.vendorId).emit("customer_subscribed_product", newSubscription);
        return res.status(201).json({
            message: "Subscribed to the product successfully!",
            success: true,
            subscription: newSubscription,
        });
    }
    catch (error) {
        console.log("Error while subscribing to the product: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const unsubscribeProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(404).json({
                message: "Product id is empty!",
                success: false,
            });
        }
        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({
                message: "Product doesn't exist!",
                success: false,
            });
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false });
        }
        const vendorCustomer = await db.vendorCustomers.findUnique({
            where: {
                vendorId_customerId: {
                    vendorId: product.vendorId,
                    customerId: user.id,
                },
            },
        });
        if (!vendorCustomer) {
            return res.status(404).json({
                message: "Vendor Customer doesn't exist",
                success: false,
            });
        }
        const subscription = await db.customerSubscription.findUnique({
            where: {
                vendorCustomerId_productId: {
                    vendorCustomerId: vendorCustomer.id,
                    productId,
                },
            },
        });
        if (!subscription) {
            return res.status(404).json({
                message: "No subscription found for this product!",
                success: false,
            });
        }
        await db.customerSubscription.delete({
            where: {
                vendorCustomerId_productId: {
                    vendorCustomerId: vendorCustomer.id,
                    productId,
                },
            },
        });
        req.io.to(product.vendorId).emit("customer_unsubcribed_product", productId);
        return res.status(200).json({
            message: "Product removed from subscription!",
            success: true,
        });
    }
    catch (error) {
        console.log("Error while removing subscribed product: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const getMySubscriptions = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false });
        }
        const subscriptions = await SubscriptionService.getCustomerSubscriptions(user.id);
        const stats = [];
        for (const subscription of subscriptions) {
            const subscriptionStats = await SubscriptionService.getSubscriptionStats(subscription.id);
            if (subscriptionStats) {
                stats.push(subscriptionStats);
            }
        }
        return res.status(200).json({
            message: "Subscriptions fetched successfully!",
            success: true,
            subscriptions: stats,
        });
    }
    catch (error) {
        console.log("Error while fetching subscriptions: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const getSubscriptionCalendar = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. Valid user session required.", success: false });
        }
        const subscriptionId = req.params.id;
        if (!subscriptionId) {
            return res.status(400).json({ message: "Subscription ID is required", success: false });
        }
        const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        if (month < 1 || month > 12) {
            return res.status(400).json({ message: "Invalid month. Must be between 1 and 12", success: false });
        }
        const subscription = await db.customerSubscription.findUnique({
            where: { id: subscriptionId },
            include: {
                vendorCustomers: {
                    select: {
                        customerId: true,
                    },
                },
            },
        });
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found", success: false });
        }
        if (subscription.vendorCustomers.customerId !== user.id) {
            return res.status(403).json({ message: "You are not authorized to view this subscription", success: false });
        }
        const calendar = await SubscriptionService.getMonthlyCalendar(subscriptionId, year, month);
        return res.status(200).json({
            message: "Calendar fetched successfully!",
            success: true,
            calendar,
            month,
            year,
        });
    }
    catch (error) {
        console.log("Error while fetching calendar: ", error.message);
        if (error.message === "Subscription not found") {
            return res.status(404).json({ message: "Subscription not found", success: false });
        }
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const customerSubscribedProduct = async (req, res) => {
    try {
        const userId = req?.user?.id;
        if (!userId) {
            return res.status(404).json({
                message: "Please login first!",
                success: false,
            });
        }
        const subscribedProducts = await db.product.findMany({
            where: {
                subscription: {
                    some: {
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
        });
        return res.status(200).json({
            message: "Products fetched successfully!",
            success: true,
            subscribeProduct: subscribedProducts,
        });
    }
    catch (error) {
        console.log("Error while fetching subscribed products: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const vendorSubscibedProducts = async (req, res) => {
    try {
        const vendor = req.vendor;
        if (!vendor) {
            return res.status(401).json({
                message: "Vendor doesn't exist!",
                success: false,
            });
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
        });
        return res.status(200).json({
            message: "Customer subcribed products fetched successfully!",
            success: true,
            subscribedProducts,
        });
    }
    catch (error) {
        console.log("Error while fetching customer subscribed products: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const getVendorCustomerSubscriptions = async (req, res) => {
    try {
        const vendor = req.vendor;
        if (!vendor) {
            return res.status(401).json({
                message: "Vendor doesn't exist!",
                success: false,
            });
        }
        const customerId = req.params.customerId;
        if (!customerId) {
            return res.status(400).json({
                message: "Customer ID is required",
                success: false,
            });
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
        });
        return res.status(200).json({
            message: "Customer subscriptions fetched successfully!",
            success: true,
            subscribedProducts,
        });
    }
    catch (error) {
        console.log("Error while fetching customer subscriptions: ", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const getVendorSubscriptionCalendar = async (req, res) => {
    try {
        const vendor = req.vendor;
        if (!vendor) {
            return res.status(401).json({ message: "Vendor doesn't exist!", success: false });
        }
        const subscriptionId = req.params.id;
        if (!subscriptionId) {
            return res.status(400).json({ message: "Subscription ID is required", success: false });
        }
        const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        if (month < 1 || month > 12) {
            return res.status(400).json({ message: "Invalid month. Must be between 1 and 12", success: false });
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
        });
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found", success: false });
        }
        if (subscription.vendorCustomers.vendorId !== vendor.id) {
            return res.status(403).json({ message: "You are not authorized to view this subscription", success: false });
        }
        const calendar = await SubscriptionService.getMonthlyCalendar(subscriptionId, year, month);
        return res.status(200).json({
            message: "Calendar fetched successfully!",
            success: true,
            calendar,
            month,
            year,
        });
    }
    catch (error) {
        console.log("Error while fetching vendor calendar: ", error.message);
        if (error.message === "Subscription not found") {
            return res.status(404).json({ message: "Subscription not found", success: false });
        }
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
        });
    }
};
export const getVendorSubscriptionStats = async (req, res) => {
    try {
        const vendor = req.vendor;
        if (!vendor) {
            return res.status(401).json({ message: "Vendor doesn't exist!", success: false });
        }
        const subscriptionId = req.params.id;
        if (!subscriptionId) {
            return res.status(400).json({ message: "Subscription ID is required", success: false });
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
        });
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found", success: false });
        }
        if (subscription.vendorCustomers.vendorId !== vendor.id) {
            return res.status(403).json({ message: "You are not authorized to view this subscription", success: false });
        }
        const stats = await SubscriptionService.getVendorSubscriptionStats(subscriptionId);
        return res.status(200).json({
            message: "Subscription stats fetched successfully!",
            success: true,
            stats,
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
export const isValidRequest = async (req, res) => {
    try {
    }
    catch (error) {
    }
};
//# sourceMappingURL=customerSubscription.controlers.js.map