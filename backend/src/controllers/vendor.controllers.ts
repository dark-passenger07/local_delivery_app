import { Request, Response } from "express"
import { z } from "zod"
import { VendorSchema } from "../generated/zod/index.js"
import { db } from "../libs/db.js";
import { uploadToCloudinary } from "../libs/cloudinary.js";



export const createVendorProfile = async(req: Request, res: Response) =>{
  try {
    const vendor = VendorSchema.omit({
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }).extend({
      image: z.string().nullable().optional(),
    })

    const validateBody = vendor.safeParse(req.body);
    if(!validateBody.success){
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }
    const user = req.user;
    if(!user){
      return res.status(401).json({
        message: "Unauthorize",
        success: false
      })
    }
    const { businessName, businessPhone} = validateBody.data;

    if(!user){
      return res.status(400).json({
        message: "Please login!",
        success: false 
      })
    }

    const newVendorProfile = await db.vendor.create({
      data:{
        businessName,
        businessPhone,
        userId: user.id 
      },
      include:{
        user: true
      }
    })

    if(!newVendorProfile){
      return res.status(500).json({
        message: "Somethine went wrong!",
        success: false
      })
    }

    // req.vendor = newVendorProfile;

    return res.status(201).json({
      message: "Vendor profile created",
      success: true,
      profile: newVendorProfile,
    })
  } catch (error: any) {
    console.log("Error while creating vendor profile: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

export const vendorProfile = async(req: Request, res: Response) =>{
  try {
    // check if vendor profile exists or not
    // console.log("Request is hitting vendorProfile")
    const user = req.user
    if(user?.role == "CUSTOMER"){
      return res.status(403).json({
        message: "You are not allowed to perform this action!",
        success: false
      })
    }
    // const id = req.params.id as string
    const vendorProfile = await db.vendor.findUnique({where: {
      userId: user?.id,
    },
    include: {
      user: true
    }
    });
    if(!vendorProfile){
      return res.status(404).json({
        message: "Vendor profile doesn't exists!",
        success: false,
      })
    }
    // render the profile
    return res.status(200).json({
      message: "Vendor profile fetched successfully!",
      success: true,
      vendorProfile: vendorProfile
    })
  } catch (error: any) {
    console.log("Error fetching vendor profile: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

// show all the vendor profile to the added customers
export const getALlVendorProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const allVendorProfile = await db.vendor.findMany({
      where: {
        vendorcustomers: {
          some: {
            customerId: user?.id
          }
        }
      }
    })

    if (!allVendorProfile) {
      return res.status(404).json({
        message: "No vendor profile available",
        success: false
      })
    }

    return res.status(200).json({
      message: "Vendor profiles fetched successfully!",
      success: true,
      allVendorProfile: allVendorProfile
    })
  } catch (error: any) {
    console.log("Error fetching vendor profiles to the added customer: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}

// Vendor uploads / replaces their profile image. The file arrives as multipart
// form-data (field name "image") and is streamed to Cloudinary; only the
// resulting secure_url is stored on the Vendor row.
export const uploadVendorImage = async (req: Request, res: Response) => {
  try {
    const vendor = req.vendor;
    if (!vendor) {
      return res.status(404).json({
        message: "Please create your vendor profile first!",
        success: false,
      })
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided. Please pick an image and try again.",
        success: false,
      })
    }

    const { secureUrl } = await uploadToCloudinary(req.file.buffer, "vendor_profiles")

    const updatedProfile = await db.vendor.update({
      where: { id: vendor.id },
      data: { image: secureUrl },
      include: { user: true },
    })

    return res.status(200).json({
      message: "Profile image updated successfully!",
      success: true,
      image: secureUrl,
      profile: updatedProfile,
    })
  } catch (error: any) {
    console.log("Error uploading vendor image: ", error.message)
    return res.status(500).json({
      message: "Failed to upload image. Please try again.",
      success: false,
    })
  }
}

// Vendor edits their profile. Personal name/address live on the User row while
// businessName/businessPhone live on the Vendor row, so both are updated in a
// single transaction. The login phone (User.phone) is intentionally NOT editable
// here because it is the unique account identity used to sign in.
const UpdateVendorProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").optional(),
  address: z.string().trim().min(2, "Address must be at least 2 characters long").optional(),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters long").optional(),
  businessPhone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
})

export const updateVendorProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const vendor = req.vendor
    if (!user || !vendor) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      })
    }

    const validateBody = UpdateVendorProfileSchema.safeParse(req.body)
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      })
    }

    const { name, address, businessName, businessPhone } = validateBody.data

    // Build partial updates so untouched fields are left exactly as they were.
    const userData: { name?: string; address?: string } = {}
    if (name !== undefined) userData.name = name
    if (address !== undefined) userData.address = address

    const vendorData: { businessName?: string; businessPhone?: string } = {}
    if (businessName !== undefined) vendorData.businessName = businessName
    if (businessPhone !== undefined) vendorData.businessPhone = businessPhone

    const hasUserUpdate = Object.keys(userData).length > 0
    const hasVendorUpdate = Object.keys(vendorData).length > 0

    if (!hasUserUpdate && !hasVendorUpdate) {
      return res.status(400).json({
        message: "No fields to update",
        success: false,
      })
    }

    await db.$transaction(async (tx) => {
      if (hasUserUpdate) {
        await tx.user.update({ where: { id: user.id }, data: userData })
      }
      if (hasVendorUpdate) {
        await tx.vendor.update({ where: { id: vendor.id }, data: vendorData })
      }
    })

    const updatedProfile = await db.vendor.findUnique({
      where: { id: vendor.id },
      include: { user: true },
    })

    return res.status(200).json({
      message: "Profile updated successfully!",
      success: true,
      profile: updatedProfile,
    })
  } catch (error: any) {
    console.log("Error updating vendor profile: ", error.message)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}