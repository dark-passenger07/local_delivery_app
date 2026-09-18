import express from "express"
import { currentUserController, loginController, logoutController, signupController, updateProfileController } from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const userRouter = express.Router();

userRouter.post("/signup",signupController)

userRouter.post("/login", loginController)

userRouter.post("/logout",isAuthenticated, logoutController)

userRouter.get("/me",isAuthenticated,currentUserController)

// user edits their own name / address (phone stays locked as the login identity)
userRouter.patch("/update-profile", isAuthenticated, updateProfileController)

export default userRouter;