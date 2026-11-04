import express from "express";
import { createFutsal, getAllFutsals, getMyFutsals, getFutsalById, updateFutsal, deleteFutsal } from "../controllers/futsalController.js";
import isVerifiedUser from "../middlewares/authMiddleware.js";
import { isVendor, isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", isVerifiedUser, isVendor, createFutsal);
router.get("/", getAllFutsals);
router.get("/my-futsals", isVerifiedUser, isVendor, getMyFutsals);
router.get("/:id", getFutsalById);
router.put("/:id", isVerifiedUser, isVendor, updateFutsal);
router.delete("/:id", isVerifiedUser, deleteFutsal);

export default router;

