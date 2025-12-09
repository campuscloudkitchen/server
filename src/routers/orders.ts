import { Router } from "express";
import verifyRoles from "../middlewares/verifyRoles.js";
import { createOrder, getOrderById, getUserOrders, updateOrderStatus, getOrders, getUserNotifications, deleteNotification, getDispatchOrders } from "../controllers/orders.js";
const router = Router();


router.route("/")
    .get(verifyRoles("ADMIN", "USER"), getOrders)
    .post(verifyRoles("ADMIN", "USER"), createOrder);

router.route("/user")
    .get(verifyRoles("ADMIN", "USER"), getUserOrders);

router.route("/notifications")
    .get(verifyRoles("ADMIN", "USER", "DISPATCH"), getUserNotifications);

router.route("/notifications/:id")
    .delete(verifyRoles("ADMIN", "USER"), deleteNotification);

router.route("/:id")
    .get(verifyRoles("ADMIN", "USER"), getOrderById)
    .patch(verifyRoles("ADMIN", "USER", "DISPATCH"), updateOrderStatus);

router.route("/dispatch/:id")
    .get(verifyRoles("ADMIN", "DISPATCH"), getDispatchOrders)

export default router;