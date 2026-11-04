import express from "express";
import { register, login, getUserData,logout} from "../controllers/userController.js";
import isVerifiedUser from "../middlewares/authMiddleware.js";
import { isVendor, isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/getUserData", isVerifiedUser, getUserData);
router.post("/logout", isVerifiedUser, logout);


export default router;

