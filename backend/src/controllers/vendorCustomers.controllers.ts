import { Request, Response } from "express"
import { VendorCustomersSchema } from "../generated/zod/index.js"
import { db } from "../libs/db.js";
import { sendNotification } from "../services/notification.service.js";



// add customers 
export const addCustomers = async (req: Request, res: Response) => {
  try {
    const customer = VendorCustomersSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      vendorId: true,
      customerId: true,
    })

    const validateBody = customer.safeParse(req.body);
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }

    const { customerPhone } = validateBody.data
    const user = await db.user.findUnique({ where: { phone: customerPhone } })

    if (!user) {
      return res.status(404).json({
        message: "Customer doesn't exist!",
        success: false,
      })
    }

    if (user.role === "VENDOR") {
      return res.status(400).json({
        message: "You can not add vendor profile as your customer!",
        success: false,
      })
    }

    const vendorId = req?.vendor?.id
    if (!vendorId) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false
      })
    }
    // check if the user is already a customer of the vendor or not
    const isCustomer = await db.vendorCustomers.findUnique({
      where: {
        vendorId_customerId: {
          vendorId: vendorId,
          customerId: user.id
        }
      }
    })
    if (isCustomer) {
      return res.status(400).json({
        message: "Customer already exists!",
        success: false
      })
    }
    // add customer
    const newCustomer = await db.vendorCustomers.create({
      data: {
        vendorId,
        customerPhone,
        customerId: user.id
      },
      include: {
        vendor: true,
      }
    })

    if (!newCustomer) {
      return res.status(500).json({
        message: "Something went wrong while adding customer",
        success: false
      })
    }
    const vendorProfile = newCustomer.vendor

    req.io.to(user.id).emit("vendor_added_customer", vendorProfile)

    //send notification to the customer
    await sendNotification(user.id,`You've been added as a customer`,`${vendorProfile.businessName} added you as their customer.`);

    return res.status(200).json({
      message: "Customer added successfully!",
      success: true,
      customer: newCustomer
    })
  } catch (error: any) {
    console.log("Error inside of vendor customers controller: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

export const removeCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const customer = await db.user.findUnique({ where: { id } })
    if (!customer) {
      return res.status(404).json({
        message: "Customer doesn't exist!",
        success: false
      })
    }

    const vendorId = req?.vendor?.id;
    if (!vendorId) {
      return res.status(401).json({
        message: "Vendor doesn't exist!",
        success: false
      })
    }
    const isCustomer = await db.vendorCustomers.findUnique({
      where: {
        vendorId_customerId: {
          vendorId: vendorId,
          customerId: customer.id
        }
      }
    })

    if (!isCustomer) {
      return res.status(400).json({
        message: "Sorry! This user is not your customer",
        success: false
      })
    }

    await db.vendorCustomers.delete(
      {
        where: {
          vendorId_customerId: {
            vendorId: vendorId,
            customerId: customer.id
          }
        }
      }
    )

    // update the customer instantly after getting removed
    req.io.to(customer.id).emit("customer_removed", {
      vendorId: vendorId,
    }
    )

    await sendNotification(
      customer.id,
      `Update from ${req.vendor?.businessName}`,
      `Hi ${customer.name}, you have been removed from the customer list by ${req.vendor?.businessName}.`
    );


    return res.status(200).json({
      message: "Customer removed successfully!",
      success: true,
    })

  } catch (error: any) {
    console.log("Error while removing customer: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

export const getAllVendorCustomer = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(404).json({
        message: "Please login with your vendor profile",
        success: false,
      })
    }
    const customers = await db.vendorCustomers.findMany({
      where: {
        vendorId: vendor.id
      },
      include: {
        user: true
      }
    })
    if (!customers) {
      return res.status(404).json({
        message: "No vendor customers available",
        success: false
      })
    }
    return res.status(200).json({
      message: "Vendor customers fetched successfully!",
      success: true,
      customers: customers
    })
  } catch (error: any) {
    console.log("Error fetching all vendor customer: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}