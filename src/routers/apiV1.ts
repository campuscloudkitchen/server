import { Router } from "express";
import authRouter from "./auth.js";
import foodRouter from "./food.js";
import cartRouter from "./cart.js";
import { forgotPassword, resetPassword } from "../controllers/passwordRecovery.js";
import signup from "../controllers/signup.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = Router();

router.use("/auth", authRouter);
router.post("/signup", signup);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);
router.use(verifyJWT);
router.use("/foods", foodRouter);
router.use("/carts", cartRouter);

export default router;