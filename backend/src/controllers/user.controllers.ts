import { Request, Response } from "express"
// import { UserSchema } from "../generated/zod/index.js";
import { UserSchema } from "../generated/zod/index.js";
import { db } from "../libs/db.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"


dotenv.config()



export const signupController = async (req: Request, res: Response) => {
  try {

    const signup = UserSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    })

    const validateBody = signup.safeParse(req.body)
    // console.log(validateBody.error?.issues);

    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }


    const { name, phone, role, address } = validateBody.data;

    // console.log("Before check the users:")

    // check for existing user
    const existingUser = await db.user.findUnique({
      where: { phone },
    });

    // console.log("After checking the user")

    if (existingUser) {
      return res.status(404).json({
        message: "User already exists!",
        success: false
      })
    }
    // hash the password
    // const hashedPass = await bcrypt.hash(password,10);

    const newUser = await db.user.create({
      data: {
        name,
        phone,
        role,
        address
      }
    })

    if (!newUser) {
      return res.status(500).json({
        message: "Something went worng while creating new user!",
        success: false
      })
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '60d' })

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    })


    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        address: newUser.address
      }
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const loginController = async (req: Request, res: Response) => {
  try {
    // console.log("Backend is hit by frontend")
    const login = UserSchema.omit({
      id: true,
      name: true,
      role: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    })

    const validateBody = login.safeParse(req.body)
    console.log("validatebody: ", validateBody)
    if (!validateBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        fieldErrors: validateBody.error.flatten().fieldErrors,
      });
    }

    const { phone } = validateBody.data;
    const user = await db.user.findUnique({ where: { phone } })

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exist! Please create a new account!",
        success: false,
      })
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '60d' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    })

    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        address: user.address
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      path: "/",
      expires: new Date(0)
    })

    res.status(200).json({
      message: "User logout successfully!",
      success: true,
    })

  } catch (error: any) {
    console.log("Error while loging out: ", error.message)
    return res.status(500).json({
      message: error.message,
      success: false,
    })
  }
}

export const currentUserController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        message: "Unauthorize",
        success: false
      })
    }
    return res.status(200).json({
      message: "User data fetched successfully!",
      success: true,
      user: user
    })
  } catch (error: any) {
    console.log("Error in curr controller: ", error.message)
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    })
  }
}