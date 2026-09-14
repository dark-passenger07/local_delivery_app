import express from "express"
import {
  customerSubscribedProduct,
  getMySubscriptions,
  getSubscriptionCalendar,
  subscribeProduct,
  unsubscribeProduct,
  vendorSubscibedProducts,
  getVendorSubscriptionCalendar,
  getVendorCustomerSubscriptions,
  getVendorSubscriptionStats,
  getVendorTotalRevenue,
  getVendorDailyDeliveryReport,
  getVendorSubscriptionHistory,
  deleteStoppedSubscription,
  updateSubscriptionPrice,
} from "../controllers/customerSubscription.controlers.js"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import { isCreatedVendorProfile } from "../middlewares/isCreatedVendorProfile.js"
import { isRoleCustomer } from "../middlewares/isRoleCustomer.js"
import { isVendor } from "../middlewares/isVendor.js"

const customerSubscriptionRouter = express.Router()

customerSubscriptionRouter.post("/product/add/:id", isAuthenticated, isRoleCustomer, subscribeProduct)

customerSubscriptionRouter.delete("/product/unsubscribe-product/:id", isAuthenticated, isRoleCustomer, unsubscribeProduct)

customerSubscriptionRouter.get("/get/subscribed-product", isAuthenticated, isRoleCustomer, customerSubscribedProduct)

customerSubscriptionRouter.get("/get/customer-subcribed-product", isAuthenticated, isCreatedVendorProfile, isVendor, vendorSubscibedProducts)

customerSubscriptionRouter.get("/get/vendor/customer-subscriptions/:customerId", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorCustomerSubscriptions)

// get the subscription states of the customer
customerSubscriptionRouter.get("/my-subscriptions", isAuthenticated, isRoleCustomer, getMySubscriptions)

// show the customer the detailed calender of the product delivered or skiped
customerSubscriptionRouter.get("/calendar/:id", isAuthenticated, isRoleCustomer, getSubscriptionCalendar)
customerSubscriptionRouter.get("/vendor/calendar/:id", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorSubscriptionCalendar)
customerSubscriptionRouter.get("/vendor/stats/:id", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorSubscriptionStats)
customerSubscriptionRouter.get("/vendor/total-revenue", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorTotalRevenue)
customerSubscriptionRouter.get("/vendor/daily-delivery-report", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorDailyDeliveryReport)
customerSubscriptionRouter.get("/vendor/subscription-history", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorSubscriptionHistory)

// vendor deletes an unsubscribed (STOPPED) customer subscription record
customerSubscriptionRouter.delete("/vendor/subscription/:id", isAuthenticated, isCreatedVendorProfile, isVendor, deleteStoppedSubscription)

// vendor updates the per-unit price for one customer's subscription (from tomorrow or from the 1st of next month)
customerSubscriptionRouter.patch("/vendor/subscription/:id/price", isAuthenticated, isCreatedVendorProfile, isVendor, updateSubscriptionPrice)

export default customerSubscriptionRouter
