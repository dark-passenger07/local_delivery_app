import { db } from "../libs/db.js";
export class SubscriptionService {
    static async getCustomerSubscriptions(customerId) {
        const vendorCustomerLinks = await db.vendorCustomers.findMany({
            where: { customerId },
            select: { id: true },
        });
        const vendorCustomerIds = vendorCustomerLinks.map((vc) => vc.id);
        if (vendorCustomerIds.length === 0) {
            return [];
        }
        return db.customerSubscription.findMany({
            where: {
                vendorCustomerId: {
                    in: vendorCustomerIds,
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
                    select: {
                        id: true,
                        vendorId: true,
                        customerId: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    static async getSubscriptionStats(subscriptionId) {
        const subscription = await db.customerSubscription.findUnique({
            where: { id: subscriptionId },
            include: {
                product: {
                    select: {
                        productName: true,
                        unit: true,
                    },
                },
            },
        });
        if (!subscription) {
            return null;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(subscription.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (today < startDate) {
            return {
                subscriptionId: subscription.id,
                productName: subscription.product.productName,
                productUnit: subscription.product.unit,
                dailyQuantity: subscription.dailyQuantity.toString(),
                startDate: subscription.startDate.toISOString(),
                receivedDays: 0,
                skippedDays: 0,
                currentDailyQuantity: subscription.dailyQuantity.toString(),
                upcomingRequests: 0,
            };
        }
        const vendorCustomerId = subscription.vendorCustomerId;
        const acceptedRequests = await db.requests.findMany({
            where: {
                vendorCustomerId,
                productId: subscription.productId,
                status: "ACCEPTED",
            },
        });
        let receivedDays = 0;
        let skippedDays = 0;
        const currentDate = new Date(today);
        for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
            const dayStart = new Date(d);
            dayStart.setHours(0, 0, 0, 0);
            const effectiveQuantity = this.getEffectiveQuantityForDate(dayStart, subscription.dailyQuantity.toString(), acceptedRequests);
            if (effectiveQuantity === "0") {
                skippedDays++;
            }
            else {
                receivedDays++;
            }
        }
        const upcomingRequests = acceptedRequests.filter((req) => {
            const end = new Date(req.end_date);
            return end >= today;
        }).length;
        return {
            subscriptionId: subscription.id,
            productName: subscription.product.productName,
            productUnit: subscription.product.unit,
            dailyQuantity: subscription.dailyQuantity.toString(),
            startDate: subscription.startDate.toISOString(),
            receivedDays,
            skippedDays,
            currentDailyQuantity: subscription.dailyQuantity.toString(),
            upcomingRequests,
        };
    }
    static async getVendorSubscriptionStats(subscriptionId) {
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
            return null;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(subscription.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (today < startDate) {
            return {
                totalDeliveredQuantity: "0",
                receivedDays: 0,
                skippedDays: 0,
            };
        }
        const acceptedRequests = await db.requests.findMany({
            where: {
                vendorCustomerId: subscription.vendorCustomerId,
                productId: subscription.productId,
                status: "ACCEPTED",
            },
        });
        let totalDeliveredQuantity = 0;
        let receivedDays = 0;
        let skippedDays = 0;
        const currentDate = new Date(today);
        for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
            const dayStart = new Date(d);
            dayStart.setHours(0, 0, 0, 0);
            const effectiveQuantity = this.getEffectiveQuantityForDate(dayStart, subscription.dailyQuantity.toString(), acceptedRequests);
            const qty = parseInt(effectiveQuantity, 10) || 0;
            totalDeliveredQuantity += qty;
            if (qty === 0) {
                skippedDays++;
            }
            else {
                receivedDays++;
            }
        }
        return {
            totalDeliveredQuantity: totalDeliveredQuantity.toString(),
            receivedDays,
            skippedDays,
        };
    }
    static async getMonthlyCalendar(subscriptionId, year, month) {
        const subscription = await db.customerSubscription.findUnique({
            where: { id: subscriptionId },
            include: {
                product: {
                    select: {
                        productName: true,
                        unit: true,
                    },
                },
                vendorCustomers: {
                    select: {
                        id: true,
                        vendorId: true,
                        customerId: true,
                    },
                },
            },
        });
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        const acceptedRequests = await db.requests.findMany({
            where: {
                vendorCustomerId: subscription.vendorCustomerId,
                productId: subscription.productId,
                status: "ACCEPTED",
            },
        });
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);
        const calendarDays = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(subscription.startDate);
        startDate.setHours(0, 0, 0, 0);
        const prevMonthLastDay = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonthLastDay.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const dayDate = new Date(year, month - 1, prevMonthDays - i);
            calendarDays.push({
                date: dayDate.toISOString().split("T")[0],
                dayNumber: dayDate.getDate(),
                monthNumber: month - 1,
                year: dayDate.getFullYear(),
                isCurrentMonth: false,
                quantity: "0",
                isDelivered: false,
                isSkipped: false,
                isUpcoming: false,
                requestType: null,
                requestId: null,
            });
        }
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            const dayDate = new Date(year, month - 1, day);
            dayDate.setHours(0, 0, 0, 0);
            const isUpcoming = dayDate > today;
            const isBeforeStart = dayDate < startDate;
            let quantity = subscription.dailyQuantity.toString();
            let isSkipped = false;
            let isDelivered = false;
            let requestType = null;
            let requestId = null;
            if (!isBeforeStart) {
                const applicableRequests = acceptedRequests
                    .filter((req) => {
                    const reqStart = new Date(req.start_date);
                    const reqEnd = new Date(req.end_date);
                    reqStart.setHours(0, 0, 0, 0);
                    reqEnd.setHours(23, 59, 59, 999);
                    return dayDate >= reqStart && dayDate <= reqEnd;
                })
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                if (applicableRequests.length > 0) {
                    const effectiveRequest = applicableRequests[0];
                    requestType = effectiveRequest.type;
                    requestId = effectiveRequest.id;
                    if (effectiveRequest.type === "SKIP") {
                        quantity = "0";
                        isSkipped = true;
                    }
                    else if (effectiveRequest.type === "INCREASE" && effectiveRequest.requestedQuantity) {
                        quantity = effectiveRequest.requestedQuantity.toString();
                        isDelivered = true;
                    }
                    else if (effectiveRequest.type === "DECREASE" && effectiveRequest.requestedQuantity) {
                        quantity = effectiveRequest.requestedQuantity.toString();
                        isDelivered = true;
                    }
                    else if (effectiveRequest.type === "NOTE") {
                        isDelivered = true;
                    }
                }
                else if (!isUpcoming) {
                    isDelivered = true;
                }
            }
            calendarDays.push({
                date: dayDate.toISOString().split("T")[0],
                dayNumber: day,
                monthNumber: month - 1,
                year,
                isCurrentMonth: true,
                quantity,
                isDelivered: isDelivered && !isBeforeStart && !isUpcoming,
                isSkipped,
                isUpcoming,
                requestType,
                requestId,
            });
        }
        const totalCells = Math.ceil(calendarDays.length / 7) * 7;
        const remainingCells = totalCells - calendarDays.length;
        for (let i = 1; i <= remainingCells; i++) {
            const dayDate = new Date(year, month, i);
            calendarDays.push({
                date: dayDate.toISOString().split("T")[0],
                dayNumber: i,
                monthNumber: month,
                year,
                isCurrentMonth: false,
                quantity: "0",
                isDelivered: false,
                isSkipped: false,
                isUpcoming: false,
                requestType: null,
                requestId: null,
            });
        }
        return calendarDays;
    }
    static getEffectiveQuantityForDate(date, baseQuantity, acceptedRequests) {
        const applicableRequests = acceptedRequests
            .filter((req) => {
            const reqStart = new Date(req.start_date);
            const reqEnd = new Date(req.end_date);
            reqStart.setHours(0, 0, 0, 0);
            reqEnd.setHours(23, 59, 59, 999);
            return date >= reqStart && date <= reqEnd;
        })
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (applicableRequests.length === 0) {
            return baseQuantity;
        }
        const effectiveRequest = applicableRequests[0];
        if (effectiveRequest.type === "SKIP") {
            return "0";
        }
        else if (effectiveRequest.type === "INCREASE" && effectiveRequest.requestedQuantity) {
            return effectiveRequest.requestedQuantity.toString();
        }
        else if (effectiveRequest.type === "DECREASE" && effectiveRequest.requestedQuantity) {
            return effectiveRequest.requestedQuantity.toString();
        }
        return baseQuantity;
    }
}
//# sourceMappingURL=subscription.service.js.map