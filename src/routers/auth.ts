import { Router } from "express";
import { refresh, signin, signout, verifyEmail } from "../controllers/auth.js";

const router = Router();

router.post("/", signin);
router.post("/signout", signout);
router.get("/refresh", refresh);
router.get("/verify/:token", verifyEmail);

export default router;