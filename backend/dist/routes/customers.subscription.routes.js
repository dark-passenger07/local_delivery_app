import express from "express";
import { customerSubscribedProduct, getMySubscriptions, getSubscriptionCalendar, subscribeProduct, unsubscribeProduct, vendorSubscibedProducts, getVendorSubscriptionCalendar, getVendorCustomerSubscriptions, getVendorSubscriptionStats, } from "../controllers/customerSubscription.controlers.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isCreatedVendorProfile } from "../middlewares/isCreatedVendorProfile.js";
import { isRoleCustomer } from "../middlewares/isRoleCustomer.js";
import { isVendor } from "../middlewares/isVendor.js";
const customerSubscriptionRouter = express.Router();
customerSubscriptionRouter.post("/product/add/:id", isAuthenticated, isRoleCustomer, subscribeProduct);
customerSubscriptionRouter.delete("/product/unsubscribe-product/:id", isAuthenticated, isRoleCustomer, unsubscribeProduct);
customerSubscriptionRouter.get("/get/subscribed-product", isAuthenticated, isRoleCustomer, customerSubscribedProduct);
customerSubscriptionRouter.get("/get/customer-subcribed-product", isAuthenticated, isCreatedVendorProfile, isVendor, vendorSubscibedProducts);
customerSubscriptionRouter.get("/get/vendor/customer-subscriptions/:customerId", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorCustomerSubscriptions);
customerSubscriptionRouter.get("/my-subscriptions", isAuthenticated, isRoleCustomer, getMySubscriptions);
customerSubscriptionRouter.get("/calendar/:id", isAuthenticated, isRoleCustomer, getSubscriptionCalendar);
customerSubscriptionRouter.get("/vendor/calendar/:id", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorSubscriptionCalendar);
customerSubscriptionRouter.get("/vendor/stats/:id", isAuthenticated, isCreatedVendorProfile, isVendor, getVendorSubscriptionStats);
export default customerSubscriptionRouter;
//# sourceMappingURL=customers.subscription.routes.js.map