import { Request, Response } from "express"
import { ProductSchema } from "../generated/zod/index.js";
import { db } from "../libs/db.js";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const productDetails = ProductSchema.omit({
      createdAt: true,
      updatedAt: true,
      id: true,
      vendorId: true,
    })

    const validateBody = productDetails.safeParse(req.body);
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }
    const { description, productName, unit } = validateBody.data
    // const newProduct = 
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
        unit
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
    console.log("Customers id: ",customerIds)
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

    console.log("vendor Customers inside of removeProduct: ", customers)

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