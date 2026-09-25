import express from "express"
import { addProduct, getAllProducts, getProductById, getProductPriceHistory, removeProduct, showProductsToAddedCustomer, updateProduct } from "../controllers/product.controllers.js";
import { isVendor } from "../middlewares/isVendor.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isCreatedVendorProfile } from "../middlewares/isCreatedVendorProfile.js";
import { isRoleVendor } from "../middlewares/isRoleVendor.js";
import { isRoleCustomer } from "../middlewares/isRoleCustomer.js";

const productRouter = express.Router();

productRouter.post("/add-product",isAuthenticated,isCreatedVendorProfile,isVendor, addProduct)

// vendor edits an existing product's price
productRouter.patch("/update-product/:id",isAuthenticated,isCreatedVendorProfile,isVendor, updateProduct)

productRouter.delete("/delete-product/:id",isAuthenticated,isCreatedVendorProfile,isVendor, removeProduct)

// show all product of vendor to the vendor
productRouter.get("/all-products",isAuthenticated,isRoleVendor,isVendor, getAllProducts)

// get product by id
productRouter.get("/vendor/product/:id", isAuthenticated, getProductById)

// show all the vendor products to vendor customer using vendor id
productRouter.get("/vendor-products/:vendorId", isAuthenticated, isRoleCustomer,showProductsToAddedCustomer)

// price-change history of a product — readable by the owning vendor AND the
// vendor's customers (authorization handled inside the controller)
productRouter.get("/price-history/:id", isAuthenticated, getProductPriceHistory)

export default productRouter;