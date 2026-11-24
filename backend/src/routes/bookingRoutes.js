import express from "express";
import {
    createBooking,
    getMyBookings,
    cancelBooking,
} from "../controllers/bookingController.js";
import isVerifiedUser from "../middlewares/authMiddleware.js";
import { isCustomer } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", isVerifiedUser, isCustomer, createBooking);
router.get("/my", isVerifiedUser, isCustomer, getMyBookings);   // must come before any "/:id"
router.patch("/:id/cancel", isVerifiedUser, isCustomer, cancelBooking);

export default router;