import { Request, Response } from "express"
import { z } from "zod"
import { db } from "../libs/db.js";

// Product creation is validated with an explicit schema (rather than the
// generated ProductSchema) so price validation lives alongside the other
// fields and doesn't depend on the Prisma client being regenerated first.
const ProductUnitEnum = z.enum([
  "PIECE",
  "PACKET",
  "BOTTLE",
  "LITRE",
  "ML",
  "KG",
  "GRAM",
  "DOZEN",
])

const AddProductSchema = z.object({
  productName: z.string().trim().min(2, { message: "Product name must be at least 2 characters" }),
  description: z.string().trim().min(2, { message: "Product description must be at least 2 characters" }),
  unit: ProductUnitEnum,
  price: z.coerce.number().positive("Price must be a positive number"),
})

export const addProduct = async (req: Request, res: Response) => {
  try {
    const validateBody = AddProductSchema.safeParse(req.body);
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }
    const { description, productName, unit, price } = validateBody.data
    const vendor = req.vendor;
    if(!vendor){
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false
      })
    }
    const newProduct = await db.product.create({
      data: {
        vendorId: vendor.id,
        description,
        productName,
        unit,
        // Prisma accepts a string for Decimal columns; keep full precision.
        price: price.toString(),
        // Seed the price-history timeline with the product's original price.
        // oldPrice is left null because there was no price before creation.
        priceHistory: {
          create: {
            newPrice: price.toString(),
          },
        },
      },
      include:{
        vendor: true
      }
    })

    // vendor customer
    const customerIds = await db.vendorCustomers.findMany({
      where:{
        vendorId: vendor.id
      },
      select:{
        customerId: true
      }
    })
    customerIds.forEach((customer) =>{
      req.io.to(customer.customerId).emit("Updated_Product_response", newProduct)
    })

    if (!newProduct) {
      return res.status(500).json({
        message: "Something went wrong!",
        success: false,
      })
    }
    return res.status(201).json({
      message: "Product created successfully!",
      success: true,
      product: newProduct
    })

  } catch (error: any) {
    console.log("Error while adding product: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

// Vendor edits an existing product's per-unit price. This is deliberately NOT
// retroactive: existing subscriptions keep the price they snapshotted at
// subscribe time (stored on the subscription + its price history), so only
// subscriptions created AFTER this edit will use the new price.
const UpdateProductSchema = z.object({
  price: z.coerce.number().positive("Price must be a positive number"),
})

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({
        message: "Product id is required!",
        success: false,
      })
    }

    const vendor = req.vendor;
    if (!vendor) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false
      })
    }

    const validateBody = UpdateProductSchema.safeParse(req.body);
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }

    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return res.status(404).json({
        message: "Product doesn't exist!",
        success: false,
      })
    }

    // Only the owning vendor may change the price.
    if (vendor.id !== product.vendorId) {
      return res.status(403).json({
        message: "Sorry you are not allowed to perform this action!",
        success: false
      })
    }

    const { price } = validateBody.data

    // Only log a history entry (and notify customers) when the price actually
    // changes. Editing to the same value is a no-op so we don't spam the
    // timeline with duplicate rows.
    const previousPrice = Number(product.price.toString())
    if (previousPrice === price) {
      return res.status(200).json({
        message: "Price is unchanged.",
        success: true,
        product,
      })
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        price: price.toString(),
        // Record the change so vendors and customers can see the old price,
        // the new price, and when it changed.
        priceHistory: {
          create: {
            oldPrice: product.price.toString(),
            newPrice: price.toString(),
          },
        },
      },
      include: { vendor: true },
    })

    // Let the vendor's customers refresh the price they'll see on new
    // subscriptions. Existing subscriptions are unaffected by design.
    const customers = await db.vendorCustomers.findMany({
      where: { vendorId: vendor.id },
      select: { customerId: true },
    })
    customers.forEach((customer) => {
      req.io.to(customer.customerId).emit("Updated_Product_response", updatedProduct)
    })

    return res.status(200).json({
      message: "Product price updated successfully!",
      success: true,
      product: updatedProduct,
    })
  } catch (error: any) {
    console.log("Error while updating product: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const removeProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(404).json({
        message: "Product id is required!",
        success: false,
      })
    }
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return res.status(404).json({
        message: "Product doesn't exist!",
        success: false,
      })
    }
    // check if the vendor is owner of the product
    const vendor = req.vendor;
    if(!vendor){
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false
      })
    }
    if(vendor.id != product.vendorId){
      return res.status(401).json({
        message: "Sorry you are not allowed to perform this action!",
        success: false
      })
    }

    await db.product.delete({ where: { id } });

    // vendor customers
    const customers = await db.vendorCustomers.findMany({
      where:{
        vendorId: vendor.id
      },
      select:{
        customerId: true
      }
    })

    customers.forEach((customer) =>{
      req.io.to(customer.customerId).emit("update_vendor_product",{
        action: "DELETE",
        productId: product.id
      })
    })


    return res.status(200).json({
      message: "Product deleted successfully!",
      success: true
    })
  } catch (error: any) {
    console.log("Error while deleting product: ", error.message)
    return res.status(500).json({
      message: "Internal Server Errror",
      success: false
    })
  }
}

// all products of specific vendor
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if(!user){
      return res.status(404).json({
        message: "Please login first!",
        success: false
      })
    }
    const allProducts = await db.product.findMany({where: {
      vendor:{
        userId: user.id
      }
    }});
    if(!allProducts){
      return res.status(404).json({
        message: "No products found!",
        success: false
      })
    }
    return res.status(200).json({
      message: "All products fetched successfully!",
      success: true,
      allProducts: allProducts
    })
  } catch (error: any) {
    console.log("Error fetching all products: ", error.message)
    return res.status(500).json({
      message: "Internal Server Errror",
      success: false
    })
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const product = await db.product.findUnique({where: {id}})
    if(!product){
      return res.status(404).json({
        message: "Product doesn't exist or removed!",
        success: false
      })
    }
    return res.status(200).json({
      message: "Product fetched successfully!",
      success: true,
      product: product
    })
  } catch (error: any) {
    console.log("Error inside of get product by id: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

export const showProductsToAddedCustomer = async(req: Request, res: Response) =>{
  try {
    const user = req.user
    if(!user){
      return res.status(404).json({
        message: "Please login!!",
        success: false
      })
    }
    const vendorId = req.params.vendorId as string
    const vendorProducts = await db.product.findMany({
      where:{
        vendorId
      },
      include:{
        vendor: true
      }
    })
    if(!vendorProducts){
      return res.status(404).json({
        message:"You are not a customer of the vendor!",
        success: false
      })
    }
    return res.status(200).json({
      message: "Vendor products fetched successfully!",
      success: true,
      vendorProducts: vendorProducts
    })
  } catch (error: any) {
    console.log("Error while fetching all the vendor products to added customers: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

// Price-change history for a single product. Readable by BOTH the owning vendor
// and any customer of that vendor, so either side can see when the vendor
// changed the price and what it was before. Gated by isAuthenticated only; the
// vendor-vs-customer authorization is done here since the two roles share it.
export const getProductPriceHistory = async (req: Request, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({
        message: "Please login first!",
        success: false,
      })
    }

    const id = req.params.id as string
    if (!id) {
      return res.status(400).json({
        message: "Product id is required!",
        success: false,
      })
    }

    const product = await db.product.findUnique({
      where: { id },
      select: { id: true, vendorId: true },
    })
    if (!product) {
      return res.status(404).json({
        message: "Product doesn't exist or was removed!",
        success: false,
      })
    }

    // Allowed if the requester owns the product (is its vendor) OR is one of
    // that vendor's customers.
    const [owningVendor, vendorCustomer] = await Promise.all([
      db.vendor.findFirst({
        where: { id: product.vendorId, userId: user.id },
        select: { id: true },
      }),
      db.vendorCustomers.findFirst({
        where: { vendorId: product.vendorId, customerId: user.id },
        select: { id: true },
      }),
    ])

    if (!owningVendor && !vendorCustomer) {
      return res.status(403).json({
        message: "Sorry, you are not allowed to view this product's price history!",
        success: false,
      })
    }

    // Newest change first; the seeded creation entry (oldPrice = null) is last.
    const priceHistory = await db.productPriceHistory.findMany({
      where: { productId: product.id },
      orderBy: { changedAt: "desc" },
    })

    return res.status(200).json({
      message: "Product price history fetched successfully!",
      success: true,
      priceHistory,
    })
  } catch (error: any) {
    console.log("Error while fetching product price history: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}