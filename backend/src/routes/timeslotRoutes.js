import express from "express";
import { createTimeSlot, getTimeSlotsByCourtId, deleteTimeSlot } from "../controllers/timeslotController.js";
import isVerifiedUser from "../middlewares/authMiddleware.js";
import { isVendor } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/slotsByCourt/:courtId", getTimeSlotsByCourtId);
router.post("/", isVerifiedUser, isVendor, createTimeSlot);
router.delete("/:id", isVerifiedUser, isVendor, deleteTimeSlot);

export default router;