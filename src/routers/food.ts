import { Router } from "express";
import multerUpload from "../config/multerUpload.js";
import { addFood, deleteFood, getFood, getFoods, updateFood } from "../controllers/food.js";
import verifyRoles from "../middlewares/verifyRoles.js";
const router = Router();


router.route("/")
    .get(getFoods)
    .post(verifyRoles("ADMIN"),multerUpload.single("photo"), addFood);


router.route("/:id")
    .get(getFood)
    .delete(verifyRoles("ADMIN"), deleteFood)
    .patch(verifyRoles("ADMIN"), multerUpload.single("photo"), updateFood);


export default router;