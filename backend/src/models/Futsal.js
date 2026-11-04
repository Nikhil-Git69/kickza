import mongoose from "mongoose";

const futsalSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        // phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Futsal = mongoose.model("Futsal", futsalSchema);

export default Futsal;
