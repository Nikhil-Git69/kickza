import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required: true,
            trim: true
        },

        description:{
            type: String,
            trim: true,
            default: ""
        },

        futsal:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Futsal",
            required: true,
            index: true
        },
        isActive: { type: Boolean, default: true },

    }
    ,{timestamps: true}
)


const Court = mongoose.model("Court", courtSchema)

export default Court;
