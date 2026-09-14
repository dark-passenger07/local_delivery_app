import { db } from "../libs/db.js";
import type { CustomerSubscription, Requests } from "../generated/zod/index.js";

export interface SubscriptionWithDetails extends CustomerSubscription {
  product: {
    id: string;
    productName: string;
    description: string;
    unit: string;
  };
  vendorCustomers: {
    id: string;
    vendorId: string;
    customerId: string;
  };
}

export interface SubscriptionStats {
  subscriptionId: string;
  productName: string;
  productUnit: string;
  dailyQuantity: string;
  startDate: string;
  receivedDays: number;
  skippedDays: number;
  currentDailyQuantity: string;
  upcomingRequests: number;
  monthlyDeliveredQuantity: string;
  vendorBusinessName: string;
  /// Per-unit price in effect today (from the subscription's price history,
  /// falling back to the price entered at subscribe time).
  price: string;
  /// A future price change scheduled by the vendor, if any.
  upcomingPrice: string | null;
  upcomingPriceEffectiveFrom: string | null;
  /// Revenue for the queried month, priced day-by-day so a mid-month price
  /// change values each day at the price that applied on that day.
  monthlyRevenue: string;
  /// All-time revenue since the subscription started, bounded by the stop
  /// date for stopped subscriptions and reflecting accepted skip/increase/
  /// decrease requests.
  totalRevenue: string;
}

/// A price and the first day it applies to, ordered oldest-first by callers.
export interface PriceRow {
  price: string;
  effectiveFrom: Date;
}

export interface VendorRevenueItem {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  productName: string;
  productUnit: string;
  price: string;
  upcomingPrice: string | null;
  upcomingPriceEffectiveFrom: string | null;
  deliveredQuantity: string;
  revenue: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

export interface VendorTotalRevenue {
  totalRevenue: string;
  items: VendorRevenueItem[];
}

export interface DailyDeliveryReportItem {
  subscriptionId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  baseQuantity: string;
  finalQuantity: string;
  requestType: string | null;
  requestMessage: string | null;
}

export interface DailyDeliveryReport {
  reportDate: string;
  totalDeliveries: number;
  totalQuantity: string;
  deliveries: DailyDeliveryReportItem[];
}

export interface CalendarDay {
  date: string;
  dayNumber: number;
  monthNumber: number;
  year: number;
  isCurrentMonth: boolean;
  quantity: string;
  isDelivered: boolean;
  isSkipped: boolean;
  isUpcoming: boolean;
  requestType: string | null;
  requestId: string | null;
  isBeforeStart: boolean;
  isStoppedDay: boolean;
}

export class SubscriptionService {
  static async getCustomerSubscriptions(customerId: string): Promise<SubscriptionWithDetails[]> {
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
        status: "ACTIVE",
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

  static async getSubscriptionStats(subscriptionId: string): Promise<SubscriptionStats | null> {
    const today = new Date();
    return this.getSubscriptionStatsForMonth(subscriptionId, today.getFullYear(), today.getMonth() + 1);
  }

  static async getSubscriptionStatsForMonth(
    subscriptionId: string,
    year: number,
    month: number
  ): Promise<SubscriptionStats | null> {
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
            vendorId: true,
            customerId: true,
          },
        },
        prices: {
          orderBy: { effectiveFrom: "asc" },
          select: { price: true, effectiveFrom: true },
        },
      },
    });

    if (!subscription) {
      return null;
    }

    const vendor = await db.vendor.findUnique({
      where: { id: subscription.vendorCustomers.vendorId },
      select: { businessName: true },
    });

    const vendorBusinessName = vendor?.businessName || '';

    const firstDayOfMonth = new Date(year, month - 1, 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const lastDayOfMonth = new Date(year, month, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    const startDate = new Date(subscription.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (month < 1 || month > 12) {
      throw new Error("Invalid month. Must be between 1 and 12");
    }

    // The price entered at subscribe time acts as the fallback for days not
    // covered by an explicit price-history row (i.e. legacy subscriptions).
    const fallbackPrice = parseFloat(subscription.price.toString()) || 0;
    const priceRows: PriceRow[] = subscription.prices.map((p) => ({
      price: p.price.toString(),
      effectiveFrom: p.effectiveFrom,
    }));

    const acceptedRequests = await db.requests.findMany({
      where: {
        vendorCustomerId: subscription.vendorCustomerId,
        productId: subscription.productId,
        status: "ACCEPTED",
      },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // For stopped subscriptions, revenue stops accruing on the stop date, so
    // all activity is only counted up to that day.
    const isStopped = subscription.status === "STOPPED" && subscription.endDate;
    const stopDay = isStopped
      ? new Date(new Date(subscription.endDate as Date).setHours(0, 0, 0, 0))
      : null;

    // The last day that can contribute revenue: today, or the stop date if the
    // subscription was stopped earlier.
    const effectiveNow = stopDay && stopDay < now ? stopDay : now;

    // All-time delivered quantity and revenue since the subscription started,
    // bounded by the stop date. Quantity reflects accepted skip / increase /
    // decrease requests, and each day is priced with the price that applied on
    // that day, so revenue stops at unsubscribe and respects price changes.
    const allTime = this.computeDeliveryTotalsInRange(
      startDate,
      effectiveNow,
      subscription.dailyQuantity.toString(),
      acceptedRequests,
      priceRows,
      fallbackPrice
    );
    const totalRevenue = allTime.revenue;

    // Price in effect today, plus any change the vendor has scheduled.
    const { current: currentPrice, upcoming } = this.splitCurrentAndUpcomingPrice(
      priceRows,
      fallbackPrice,
      now
    );
    const upcomingPrice = upcoming ? parseFloat(upcoming.price).toString() : null;
    const upcomingPriceEffectiveFrom = upcoming
      ? new Date(upcoming.effectiveFrom).toISOString()
      : null;

    if (lastDayOfMonth < startDate) {
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
        monthlyDeliveredQuantity: "0",
        vendorBusinessName,
        price: currentPrice.toString(),
        upcomingPrice,
        upcomingPriceEffectiveFrom,
        monthlyRevenue: "0",
        totalRevenue: totalRevenue.toString(),
      };
    }

    const rangeStart = firstDayOfMonth > startDate ? firstDayOfMonth : startDate;
    const rangeEnd = lastDayOfMonth < effectiveNow ? lastDayOfMonth : effectiveNow;

    const monthly = this.computeDeliveryTotalsInRange(
      rangeStart,
      rangeEnd,
      subscription.dailyQuantity.toString(),
      acceptedRequests,
      priceRows,
      fallbackPrice
    );

    const monthlyDeliveredQuantity = monthly.quantity;
    const receivedDays = monthly.receivedDays;
    const skippedDays = monthly.skippedDays;
    const monthlyRevenue = monthly.revenue;

    return {
      subscriptionId: subscription.id,
      productName: subscription.product.productName,
      productUnit: subscription.product.unit,
      dailyQuantity: subscription.dailyQuantity.toString(),
      startDate: subscription.startDate.toISOString(),
      receivedDays,
      skippedDays,
      currentDailyQuantity: subscription.dailyQuantity.toString(),
      upcomingRequests: 0,
      monthlyDeliveredQuantity: monthlyDeliveredQuantity.toString(),
      vendorBusinessName,
      price: currentPrice.toString(),
      upcomingPrice,
      upcomingPriceEffectiveFrom,
      monthlyRevenue: monthlyRevenue.toString(),
      totalRevenue: totalRevenue.toString(),
    };
  }

  static async getMonthlyCalendar(
    subscriptionId: string,
    year: number,
    month: number
  ): Promise<CalendarDay[]> {
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

    const calendarDays: CalendarDay[] = [];
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
        isBeforeStart: true,
        isStoppedDay: false,
      });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const dayDate = new Date(year, month - 1, day);
      dayDate.setHours(0, 0, 0, 0);

      const isUpcoming = dayDate > today;
      const isBeforeStart = dayDate < startDate;

      // A stopped subscription should not show activity after its stop date.
      const isStopped = subscription.status === "STOPPED" && subscription.endDate;
      const stopDay = isStopped
        ? new Date(new Date(subscription.endDate as Date).setHours(0, 0, 0, 0))
        : null;
      const isAfterStop = !!stopDay && dayDate > stopDay;

      let quantity = isAfterStop ? "0" : subscription.dailyQuantity.toString();
      let isSkipped = false;
      let isDelivered = false;
      let requestType: string | null = null;
      let requestId: string | null = null;

      if (!isBeforeStart && !isAfterStop) {
        const effectiveRequest = this.getEffectiveRequestForDate(dayDate, acceptedRequests);

        if (effectiveRequest) {

          requestType = effectiveRequest.type;
          requestId = effectiveRequest.id;

          if (effectiveRequest.type === "SKIP") {
            quantity = "0";
            isSkipped = true;
          } else if (effectiveRequest.type === "INCREASE" && effectiveRequest.requestedQuantity) {
            const base = parseFloat(subscription.dailyQuantity.toString()) || 0;
            const increase = parseFloat(effectiveRequest.requestedQuantity.toString()) || 0;
            quantity = (base + increase).toString();
            isDelivered = true;
          } else if (effectiveRequest.type === "DECREASE" && effectiveRequest.requestedQuantity) {
            const base = parseFloat(subscription.dailyQuantity.toString()) || 0;
            const decrease = parseFloat(effectiveRequest.requestedQuantity.toString()) || 0;
            quantity = Math.max(0, base - decrease).toString();
            isDelivered = true;
          }
        } else if (!isUpcoming) {
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
        isDelivered: isDelivered && !isBeforeStart && !isUpcoming && !isAfterStop,
        isSkipped,
        isUpcoming: isUpcoming && !isAfterStop,
        requestType,
        requestId,
        isBeforeStart,
        isStoppedDay: isAfterStop,
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
        isBeforeStart: false,
        isStoppedDay: false,
      });
    }
    return calendarDays;
  }

  private static getEffectiveQuantityForDate(
    date: Date,
    baseQuantity: string,
    acceptedRequests: any[]
  ): string {
    const effectiveRequest = this.getEffectiveRequestForDate(date, acceptedRequests);

    if (!effectiveRequest) {
      return baseQuantity;
    }

    if (effectiveRequest.type === "SKIP") {
      return "0";
    } else if (effectiveRequest.type === "INCREASE" && effectiveRequest.requestedQuantity) {
      const base = parseFloat(baseQuantity) || 0;
      const increase = parseFloat(effectiveRequest.requestedQuantity.toString()) || 0;
      return (base + increase).toString();
    } else if (effectiveRequest.type === "DECREASE" && effectiveRequest.requestedQuantity) {
      const base = parseFloat(baseQuantity) || 0;
      const decrease = parseFloat(effectiveRequest.requestedQuantity.toString()) || 0;
      return Math.max(0, base - decrease).toString();
    }

    return baseQuantity;
  }

  /**
   * The per-unit price that applies on a given day: the most recent price whose
   * effectiveFrom falls on or before that day. Subscriptions created before
   * price history existed have no rows, so we fall back to the price stored on
   * the subscription itself.
   */
  private static getEffectivePriceForDate(
    date: Date,
    priceRows: PriceRow[],
    fallbackPrice: number
  ): number {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    let applicable: number | null = null;
    for (const row of priceRows) {
      const from = new Date(row.effectiveFrom);
      from.setHours(0, 0, 0, 0);
      if (from <= day) {
        // priceRows are ordered oldest-first, so later matches win.
        applicable = parseFloat(row.price) || 0;
      }
    }

    return applicable ?? fallbackPrice;
  }

  /**
   * Sum the effective delivered quantity and revenue for each day in
   * [rangeStart, rangeEnd] (inclusive). Accepted skip / increase / decrease
   * requests are applied per day via getEffectiveQuantityForDate, and each day
   * is priced with the price in force on that day. Returns zeros when the range
   * is empty (e.g. a subscription whose start date is in the future).
   */
  private static computeDeliveryTotalsInRange(
    rangeStart: Date,
    rangeEnd: Date,
    baseQuantity: string,
    acceptedRequests: any[],
    priceRows: PriceRow[],
    fallbackPrice: number
  ): { quantity: number; revenue: number; receivedDays: number; skippedDays: number } {
    let quantity = 0;
    let revenue = 0;
    let receivedDays = 0;
    let skippedDays = 0;

    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);

      const effectiveQuantity = this.getEffectiveQuantityForDate(
        dayStart,
        baseQuantity,
        acceptedRequests
      );

      const qty = parseFloat(effectiveQuantity) || 0;
      const dayPrice = this.getEffectivePriceForDate(dayStart, priceRows, fallbackPrice);

      quantity += qty;
      revenue += qty * dayPrice;

      if (qty === 0) {
        skippedDays++;
      } else {
        receivedDays++;
      }
    }

    return { quantity, revenue: Math.round(revenue * 100) / 100, receivedDays, skippedDays };
  }

  /**
   * Split a subscription's price rows into the price applying today and the
   * next scheduled future change (if the vendor has queued one).
   */
  private static splitCurrentAndUpcomingPrice(
    priceRows: PriceRow[],
    fallbackPrice: number,
    today: Date
  ): { current: number; upcoming: PriceRow | null } {
    const current = this.getEffectivePriceForDate(today, priceRows, fallbackPrice);

    let upcoming: PriceRow | null = null;
    let upcomingDay: number | null = null;
    for (const row of priceRows) {
      const from = new Date(row.effectiveFrom);
      from.setHours(0, 0, 0, 0);
      // Compare on the normalized day so rows stored at different times of the
      // same day cannot flip which one is considered "next".
      if (from > today && (upcomingDay === null || from.getTime() < upcomingDay)) {
        upcoming = row;
        upcomingDay = from.getTime();
      }
    }

    return { current, upcoming };
  }

  /**
   * Aggregate all-time revenue for a vendor across every customer subscription
   * (both ACTIVE and STOPPED). Each subscription's revenue is its effective
   * delivered quantity — after accepted skip / increase / decrease requests and
   * bounded by the stop date so it stops at unsubscribe — priced day-by-day
   * from the subscription's price history.
   */
  static async getVendorTotalRevenue(vendorId: string): Promise<VendorTotalRevenue> {
    const subscriptions = await db.customerSubscription.findMany({
      where: {
        vendorCustomers: {
          vendorId,
        },
      },
      include: {
        product: {
          select: {
            productName: true,
            unit: true,
          },
        },
        vendorCustomers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        prices: {
          orderBy: { effectiveFrom: "asc" },
          select: { price: true, effectiveFrom: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const items: VendorRevenueItem[] = [];
    let totalRevenue = 0;

    for (const subscription of subscriptions) {
      const acceptedRequests = await db.requests.findMany({
        where: {
          vendorCustomerId: subscription.vendorCustomerId,
          productId: subscription.productId,
          status: "ACCEPTED",
        },
      });

      const startDate = new Date(subscription.startDate);
      startDate.setHours(0, 0, 0, 0);

      // Revenue stops accruing on the stop date for stopped subscriptions.
      const isStopped = subscription.status === "STOPPED" && subscription.endDate;
      const stopDay = isStopped
        ? new Date(new Date(subscription.endDate as Date).setHours(0, 0, 0, 0))
        : null;
      const effectiveNow = stopDay && stopDay < now ? stopDay : now;

      const fallbackPrice = parseFloat(subscription.price.toString()) || 0;
      const priceRows: PriceRow[] = subscription.prices.map((p) => ({
        price: p.price.toString(),
        effectiveFrom: p.effectiveFrom,
      }));

      const totals = this.computeDeliveryTotalsInRange(
        startDate,
        effectiveNow,
        subscription.dailyQuantity.toString(),
        acceptedRequests,
        priceRows,
        fallbackPrice
      );

      const deliveredQuantity = totals.quantity;
      const revenue = totals.revenue;
      totalRevenue += revenue;

      const { current: currentPrice, upcoming } = this.splitCurrentAndUpcomingPrice(
        priceRows,
        fallbackPrice,
        now
      );

      items.push({
        subscriptionId: subscription.id,
        customerId: subscription.vendorCustomers.user.id,
        customerName: subscription.vendorCustomers.user.name,
        productName: subscription.product.productName,
        productUnit: subscription.product.unit,
        price: currentPrice.toString(),
        upcomingPrice: upcoming ? parseFloat(upcoming.price).toString() : null,
        upcomingPriceEffectiveFrom: upcoming
          ? new Date(upcoming.effectiveFrom).toISOString()
          : null,
        deliveredQuantity: deliveredQuantity.toString(),
        revenue: revenue.toString(),
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate ? subscription.endDate.toISOString() : null,
      });
    }

    // Highest-earning subscriptions first.
    items.sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue));

    return {
      totalRevenue: (Math.round(totalRevenue * 100) / 100).toString(),
      items,
    };
  }

  static async getVendorDailyDeliveryReport(vendorId: string, reportDate: Date): Promise<DailyDeliveryReport> {
    const date = new Date(reportDate);
    date.setHours(0, 0, 0, 0);

    const subscriptions = await db.customerSubscription.findMany({
      where: {
        vendorCustomers: {
          vendorId,
        },
        status: "ACTIVE",
      },
      include: {
        product: {
          select: {
            productName: true,
          },
        },
        vendorCustomers: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const deliveries: DailyDeliveryReportItem[] = [];
    let totalQuantity = 0;

    for (const subscription of subscriptions) {
      const acceptedRequests = await db.requests.findMany({
        where: {
          vendorCustomerId: subscription.vendorCustomerId,
          productId: subscription.productId,
          status: "ACCEPTED",
        },
      });

      const finalQuantity = this.getEffectiveQuantityForDate(
        date,
        subscription.dailyQuantity.toString(),
        acceptedRequests
      );

      const parsedQuantity = parseFloat(finalQuantity) || 0;
      if (parsedQuantity <= 0) {
        continue;
      }

      const effectiveRequest = this.getEffectiveRequestForDate(date, acceptedRequests);

      deliveries.push({
        subscriptionId: subscription.id,
        customerName: subscription.vendorCustomers.user.name,
        customerPhone: subscription.vendorCustomers.user.phone,
        customerAddress: subscription.vendorCustomers.user.address,
        productName: subscription.product.productName,
        baseQuantity: subscription.dailyQuantity.toString(),
        finalQuantity: parsedQuantity.toString(),
        requestType: effectiveRequest?.type ?? null,
        requestMessage: effectiveRequest?.message ?? null,
      });

      totalQuantity += parsedQuantity;
    }

    deliveries.sort((a, b) => a.customerName.localeCompare(b.customerName) || a.productName.localeCompare(b.productName));

    return {
      reportDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      totalDeliveries: deliveries.length,
      totalQuantity: totalQuantity.toString(),
      deliveries,
    };
  }

  private static getEffectiveRequestForDate(date: Date, acceptedRequests: any[]) {
    const applicableRequests = acceptedRequests
      .filter((req) => {
        const reqStart = new Date(req.start_date);
        const reqEnd = new Date(req.end_date);
        reqStart.setHours(0, 0, 0, 0);
        reqEnd.setHours(23, 59, 59, 999);
        return date >= reqStart && date <= reqEnd;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return applicableRequests[0] ?? null;
  }
}

// export class 