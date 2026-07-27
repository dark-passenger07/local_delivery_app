import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { db } from "../libs/db.js";
dotenv.config();

interface CustomJwt {
  id: string
}

// type AuthUser = {
//   id: string
//   name: string
//   role: string
//   phone: string
//   address: string
// }

// declare global {
//   namespace Express {
//     interface Request {
//       user?: AuthUser
//     }
//   }
// }

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token
  // console.log(" token: ", token)
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwt

  console.log(`decode value: ${decode.id}`);

  const user = await db.user.findUnique({
    where: {
      id: decode.id
    },
    select: {
      id: true,
      name: true,
      role: true,
      phone: true,
      address: true
    }
  })

  if (!user) {
    return res.status(401).json({
      message: "User not found",
    })
  }
  // console.log("user inside of isAuthenticated: ", user)

  req.user = user as typeof req.user
  return next()
}