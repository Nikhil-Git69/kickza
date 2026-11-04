import mongoose from "mongoose";

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

const bookedSlotSchema = new mongoose.Schema(
    {
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TimeSlot",
            required: true,
        },
        startTime: { type: String, required: true, match: TIME_FORMAT },
        endTime: { type: String, required: true, match: TIME_FORMAT },
        price: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        futsal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Futsal",
            required: true,
            index: true,
        },
        court: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Court",
            required: true,
        },
        date: {
            type: String,
            required: true,
            match: [DATE_FORMAT, "date must be YYYY-MM-DD"],
        },
        slots: {
            type: [bookedSlotSchema],
            validate: {
                validator: (arr) => arr.length >= 1 && arr.length <= 5,
                message: "A booking must have 1 to 5 slots",
            },
        },
        totalPrice: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
            default: "pending",
        },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

// Each slot on each date can be in only one active booking.
// "slots.slot" is an array path, so every slot in the array is checked.
bookingSchema.index(
    { "slots.slot": 1, date: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
