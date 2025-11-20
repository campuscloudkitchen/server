import { Router } from "express";
import verifyRoles from "../middlewares/verifyRoles.js";
import { addToCart, getCart, removeFromCart, updateCartItemQuantity } from "../controllers/cart.js";
const router = Router();


router.route("/")
    .get(verifyRoles("ADMIN", "USER"), getCart)
    .post(verifyRoles("ADMIN", "USER"), addToCart);


router.route("/:id")
    .delete(verifyRoles("ADMIN", "USER"), removeFromCart)
    .patch(verifyRoles("ADMIN", "USER"), updateCartItemQuantity)

export default router;