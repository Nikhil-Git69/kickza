import mongoose from "mongoose";

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeslotSchema = new mongoose.Schema(
    {
        court:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Court",
            required: true,
            index: true,
        },

        startTime: {
            type: String,
            required: true,
            match: [TIME_FORMAT, "startTime must be HH:mm (24-hour)"],

        },

        endTime: {
            type: String, 
            required: true,
            match: [TIME_FORMAT, "endTime must be HH:mm (24-hour)"],
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],

        },
        days: {
            type: [Number],
            required: true, 
            default: [0, 1, 2, 3, 4, 5, 6],   //0 is sunday and 6 is saturday
            validate: {
                validator: (arr) =>
                arr.length > 0 &&
                new Set(arr).size === arr.length &&
                arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
                message: "days must be a non-empty list of unique numbers from 0 to 6",
            },
        },

        isActive: { type: Boolean, default: true },



    },
     { timestamps: true }
);


timeslotSchema.pre("validate", function () {
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        this.invalidate("endTime","End time must be greater than start time");
    }       

});


timeslotSchema.index(
    { court: 1, startTime: 1, endTime: 1, days: 1 },
    { unique: true, partialFilterExpression: { isActive: true } }
);

const TimeSlot = mongoose.model("TimeSlot", timeslotSchema);

export default TimeSlot;