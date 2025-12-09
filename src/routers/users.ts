import { Router } from "express";
import multerUpload from "../config/multerUpload.js";
import verifyRoles from "../middlewares/verifyRoles.js";
import { deleteUser, getUsers, updateUser } from "../controllers/users.js";
const router = Router();


router.route("/")
    .get(getUsers)

router.route("/:id")
    .delete(verifyRoles("ADMIN"), deleteUser)
    .patch(verifyRoles("ADMIN", "DISPATCH", "USER"), multerUpload.single("photo"), updateUser);


export default router;