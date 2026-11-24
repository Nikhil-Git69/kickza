import mongoose from "mongoose";
import createHttpError from "http-errors";
import Booking from "../models/Booking.js";
import Court from "../models/Court.js";
import TimeSlot from "../models/TimeSlot.js";
import {
    isValidDateString, nepalToday, nepalNowTime, dayOfWeek, addDays, MAX_ADVANCE_DAYS, CANCEL_CUTOFF_HOURS,
     slotStartAsDate, BOOKING_CUTOFF_MINUTES
} from "../utils/dateUtils.js";

const MAX_SLOTS = 5;
const HOLD_MINUTES = 10;


const getPriceFor = async (slot, date) => slot.price;   

const createBooking = async (req, res, next) => {
    try{
    const { courtId, date, slotIds } = req.body;

    if (!courtId || !date || !Array.isArray(slotIds)) {
        return next(createHttpError(400, "courtId, date and slotIds are required!"));
    }
    if (slotIds.length < 1 || slotIds.length > MAX_SLOTS) {
        return next(createHttpError(400, `Choose 1 to ${MAX_SLOTS} slots!`));
    }
    if (new Set(slotIds.map(String)).size !== slotIds.length) {
        return next(createHttpError(400, "Duplicate slots are not allowed!"));

    }

    if (typeof courtId !== "string" || !slotIds.every((id) => typeof id === "string")) {
        return next(createHttpError(400, "courtId and slotIds must be strings!"));
    }

    if (![courtId, ...slotIds].every((id) => mongoose.Types.ObjectId.isValid(id))) {
        return next(createHttpError(400, "Invalid courtId or slotId!"));
    }
 

    if (!isValidDateString(date)) {
        return next(createHttpError(400, "Date must be a valid YYYY-MM-DD!"));
    }
    if (date < nepalToday() || date > addDays(nepalToday(), MAX_ADVANCE_DAYS)) {
        return next(createHttpError(400, "Date is outside the allowed booking window!"));
    }
    const court = await Court.findOne({ _id: courtId, isActive: true }).populate("futsal");
    if (!court || !court.futsal || !court.futsal.isActive) {
        return next(createHttpError(404, "Court not found!"));
    }

    // if (court.futsal.owner.toString() === req.user._id.toString()) {
    //     return next(createHttpError(403, "You cannot book your own futsal!"));
    // }

    const slots = await TimeSlot.find({ _id: { $in: slotIds }, court: courtId, isActive: true });
    if (slots.length !== slotIds.length) {
        return next(createHttpError(400, "One or more slots are invalid!"));
    }

    const weekday = dayOfWeek(date);
    if (!slots.every((s) => s.days.includes(weekday))) {
        return next(createHttpError(400, "A selected slot is not available on that day!"));
    }


   const earliest = Date.now() + BOOKING_CUTOFF_MINUTES * 60 * 1000;
    if (slots.some((s) => slotStartAsDate(date, s.startTime).getTime() < earliest)) {
    return next(createHttpError(400, "Bookings close 1 hour before the slot starts!"));
    }
    // 8. build the slot snapshots and the total, all from database data
    const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const bookedSlots = await Promise.all(
        sorted.map(async (s) => ({
        slot: s._id,
        startTime: s.startTime,
        endTime: s.endTime,
        price: await getPriceFor(s, date),
    }))
    );

    const totalPrice = bookedSlots.reduce((sum, s) => sum + s.price, 0);

// 9. free up abandoned holds, then create
    await Booking.updateMany(
        { status: "pending", expiresAt: { $lt: new Date() } },
        { status: "expired" }
    );

    let booking;
        try {
        booking = await Booking.create({
            user: req.user._id,
            futsal: court.futsal._id,
            court: court._id,
            date,
            slots: bookedSlots,
            totalPrice,
            expiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
        });
} catch (error) {
        if (error.code === 11000) {
            return next(createHttpError(409, "One of these slots is already booked!"));
        }
        throw error;
}

res.status(201).json({
    success: true,
    message: "Booking created! Complete payment before it expires.",
    data: booking,
});
    }
    catch(error){
        next(error);
    }
}



const getMyBookings = async (req, res, next) => {
    try {
        await Booking.updateMany(
            { status: "pending", expiresAt: { $lt: new Date() } },
            { status: "expired" }
        );

        const filter = { user: req.user._id };
        if (req.query.status !== undefined) {
            filter.status = String(req.query.status);
        }

        const bookings = await Booking.find(filter)
            .populate("futsal", "name city")
            .populate("court", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid booking id!"));
        }

        await Booking.updateMany(
            { status: "pending", expiresAt: { $lt: new Date() } },
            { status: "expired" }
        );

        const booking = await Booking.findById(id);

        if (!booking) {
            return next(createHttpError(404, "Booking not found!"));
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return next(createHttpError(403, "You are not the owner of this booking!"));
        }

        if (!["pending", "confirmed"].includes(booking.status)) {
            return next(createHttpError(400, `A ${booking.status} booking cannot be cancelled!`));
        }

        if (booking.status === "confirmed") {
            const start = slotStartAsDate(booking.date, booking.slots[0].startTime);
            const hoursLeft = (start - Date.now()) / (1000 * 60 * 60);

            if (hoursLeft < CANCEL_CUTOFF_HOURS) {
                return next(
                    createHttpError(400, `Bookings can only be cancelled ${CANCEL_CUTOFF_HOURS} hours or more before the start time!`)
                );
            }
        }

        const updated = await Booking.findOneAndUpdate(
            { _id: id, status: booking.status },
            { status: "cancelled" },
            { new: true }
        );

        if (!updated) {
            return next(createHttpError(409, "Booking status changed, please try again!"));
        }

        res.status(200).json({ success: true, message: "Booking cancelled!" });
    } catch (error) {
        next(error);
    }
};
export { createBooking, getMyBookings, cancelBooking };