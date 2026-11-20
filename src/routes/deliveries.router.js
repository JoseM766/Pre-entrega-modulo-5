import { Router } from "express";
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryStatus,
} from "../controllers/deliveries.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

const adminOrDriver = [authenticate, authorize([USER_ROLES.ADMIN, USER_ROLES.DRIVER])];

router.get("/", ...adminOrDriver, getDeliveries);
router.get("/:id", ...adminOrDriver, getDeliveryById);
router.post("/", authenticate, authorize([USER_ROLES.ADMIN]), createDelivery);
router.patch("/:id/status", ...adminOrDriver, updateDeliveryStatus);

export default router;
