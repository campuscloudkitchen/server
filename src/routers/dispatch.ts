import { Router } from "express";
import multerUpload from "../config/multerUpload.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import { addDispatchRider, assignDispatchRider, getDispatchRiders } from "../controllers/dispatch.js";
const router = Router();


router.route("/")
    .get(verifyRoles("ADMIN", "DISPATCH"), getDispatchRiders)
    .post(verifyRoles("ADMIN"), addDispatchRider);


router.route("/:orderId")
    .patch(verifyRoles("ADMIN"), assignDispatchRider)


export default router;