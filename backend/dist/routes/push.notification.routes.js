import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { savePushTokenController, deletePushNotificationToken } from "../controllers/push.notification.controllers.js";
const pushRouter = express.Router();
pushRouter.post("/push-token", isAuthenticated, savePushTokenController);
pushRouter.delete("/push-token", isAuthenticated, deletePushNotificationToken);
export default pushRouter;
//# sourceMappingURL=push.notification.routes.js.map