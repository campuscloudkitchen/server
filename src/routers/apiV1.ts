import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import foodRouter from "./food.js";
import cartRouter from "./cart.js";
import ordersRouter from "./orders.js";
import dispatchRouter from "./dispatch.js";
import { forgotPassword, resetPassword } from "../controllers/passwordRecovery.js";
import signup from "../controllers/signup.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = Router();

router.use("/auth", authRouter);
router.post("/signup", signup);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);
router.use(verifyJWT);
router.use("/users", usersRouter);
router.use("/foods", foodRouter);
router.use("/carts", cartRouter);
router.use("/orders", ordersRouter);
router.use("/dispatch", dispatchRouter);

export default router;