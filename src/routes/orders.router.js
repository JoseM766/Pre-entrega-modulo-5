import { Router } from "express";
import { getOrders, getOrderById, createOrder } from "../controllers/orders.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

// Clientes y admin (los repartidores trabajan con entregas, no con pedidos)
const canUseOrders = [authenticate, authorize([USER_ROLES.USER, USER_ROLES.ADMIN])];

router.get("/", ...canUseOrders, getOrders);
router.get("/:id", ...canUseOrders, getOrderById);
router.post("/", ...canUseOrders, createOrder);

export default router;
