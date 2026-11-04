import express from "express";
import {createCourt, getCourtsByFutsalId, updateCourt, deleteCourt} from "../controllers/courtController.js";   
import isVerifiedUser from "../middlewares/authMiddleware.js";
import { isVendor, isAdmin } from "../middlewares/roleMiddleware.js";


const router = express.Router();


router.get("/courtsByFutsal/:futsalId", getCourtsByFutsalId);
router.post("/", isVerifiedUser, isVendor, createCourt);
router.put("/:id", isVerifiedUser, updateCourt);
router.delete("/:id", isVerifiedUser, deleteCourt);

export default router;
