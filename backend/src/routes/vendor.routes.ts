import express from "express"
import { createVendorProfile, getALlVendorProfile, updateVendorProfile, uploadVendorImage, vendorProfile } from "../controllers/vendor.controllers.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isRoleVendor } from "../middlewares/isRoleVendor.js";
import { isCreatedVendorProfile } from "../middlewares/isCreatedVendorProfile.js";
import { isVendor } from "../middlewares/isVendor.js";
import { isRoleCustomer } from "../middlewares/isRoleCustomer.js";
import { uploadSingleImage } from "../middlewares/upload.js";

const vendorRouter = express.Router();


vendorRouter.post("/create/vendor-profile",isAuthenticated,isRoleVendor, createVendorProfile)

// fetch vendor profile
vendorRouter.get("/vendor-profile" ,isAuthenticated,isCreatedVendorProfile,isRoleVendor, isVendor, vendorProfile)

// vendor updates editable profile fields (name/address/businessName/businessPhone)
vendorRouter.patch("/update-profile", isAuthenticated, isVendor, updateVendorProfile)

// vendor uploads / replaces their profile image (multipart form-data, field "image")
vendorRouter.post("/upload-image", isAuthenticated, isVendor, uploadSingleImage, uploadVendorImage)


// fetch all the vendor profile to the added customer by the vendor
vendorRouter.get("/customer/vendor-profile", isAuthenticated, isRoleCustomer, getALlVendorProfile)

export default vendorRouter;