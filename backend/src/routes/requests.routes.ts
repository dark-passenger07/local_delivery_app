import express from "express" 
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { cancelCustomerRequest, customerRequest, customerRequestStatus, getCustomerRequests, vendorResponse } from "../controllers/request.controllers.js";
import { isCreatedVendorProfile } from "../middlewares/isCreatedVendorProfile.js";
import { isVendor } from "../middlewares/isVendor.js";
import { isRoleCustomer } from "../middlewares/isRoleCustomer.js";

const requestRouter = express.Router()

// allow customer to request vendor
requestRouter.post("/new-request", isAuthenticated, isRoleCustomer,customerRequest)

// allow a customer to cancel their own pending request
requestRouter.delete("/cancel-request/:id", isAuthenticated, isRoleCustomer, cancelCustomerRequest)

// list all the requests of customers to the vendor
requestRouter.get("/all-requests",isAuthenticated,isCreatedVendorProfile,isVendor, getCustomerRequests)

// allow vendor to accept or reject requests
requestRouter.put("/update-request/:id", isAuthenticated,isCreatedVendorProfile,isVendor,vendorResponse)

// list the status of request to the customer
requestRouter.get("/request-status", isAuthenticated, isRoleCustomer,customerRequestStatus)

export default requestRouter;