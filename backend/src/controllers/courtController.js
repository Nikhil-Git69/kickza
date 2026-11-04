import Court from "../models/Court.js";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import Futsal from "../models/Futsal.js";


const createCourt = async (req, res, next) => {
    try{
        const { name, description, futsalId } = req.body;

         if(!name || !futsalId){
            return next(createHttpError(400, "Name and futsalId are required!"));
        }

        if(!mongoose.Types.ObjectId.isValid(futsalId)){
            return next(createHttpError(400, "Invalid futsalId!"));
        }

        const futsal = await Futsal.findOne({ _id: futsalId, isActive: true });

        if (!futsal) {
         return next(createHttpError(404, "Futsal not found!"));
        }

        if (futsal.owner.toString() !== req.user._id.toString()) {
         return next(createHttpError(403, "You can only add courts to your own futsal!"));
        }
        const court = await Court.create({
            name,
            description,
            futsal: futsalId
        });

        res.status(201).json({
            success: true,
            message: "Court created!",
            data: court,
        }); 

    }   
    catch(error){
        next(error);
    }
}

const getCourtsByFutsalId = async (req, res, next) => {
    try {


        const { futsalId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(futsalId)) {
            return next(createHttpError(400, "Invalid futsalId!"));
        }


        const futsal = await Futsal.findOne({ _id: futsalId, isActive: true });

        if (!futsal) {
            return next(createHttpError(404, "Futsal not found!"));
        }

        const courts = await Court.find({ futsal: futsalId, isActive: true }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: courts });
    } catch (error) {
        next(error);
    }
}

const updateCourt = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid Court Id!"));
        }
        
        const court = await Court.findOne({ _id: id, isActive: true }).populate("futsal");

        if (!court || !court.futsal || !court.futsal.isActive) {
            return next(createHttpError(404, "Court not found!"));
        }


        const isOwner = court.futsal.owner.toString() === req.user._id.toString();
        const isAdminUser = req.user.role === "admin";

        if(!isOwner && !isAdminUser){
            return next(createHttpError(403, "Not allowed to update this court!"));
        }

        for (const field of ["name", "description"]) {
            if (req.body[field] !== undefined) {
                court[field] = req.body[field];
            }   
        }

        await court.save();
       
        res.status(200).json({
            success: true,
            message: "Court updated!",
            data: court,
        });
    }
    catch(error)
    {
        next(error);
    }

}



const deleteCourt = async (req, res, next) => {
    try{
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid Court Id!"));
        }

        const court = await Court.findOne({ _id: id, isActive: true }).populate("futsal");

        if (!court || !court.futsal || !court.futsal.isActive) {
            return next(createHttpError(404, "Court not found!"));
        }

        const isOwner = court.futsal.owner.toString() === req.user._id.toString();
        const isAdminUser = req.user.role === "admin";

        if(!isOwner && !isAdminUser){
            return next(createHttpError(403, "Not allowed to delete this court!"));
        }


        court.isActive = false;
        await court.save();

        res.status(200).json({
            success: true,
            message: "Court deleted!",
        }); 
    }
    catch(error){
        next(error);
    }
}

export { createCourt, getCourtsByFutsalId, updateCourt, deleteCourt };
