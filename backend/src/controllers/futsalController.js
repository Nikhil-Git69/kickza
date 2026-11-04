import Futsal from "../models/Futsal.js";
import createHttpError from "http-errors";
import mongoose from "mongoose";

const createFutsal = async (req, res, next) => {
    try {
        const { name, description, address, city } = req.body;

        if (!name || !description || !address || !city) {
            return next(
                createHttpError(400, "Name, description, address and city are required!")
            );
        }

        const futsal = await Futsal.create({
            name,
            description,
            address,
            city,
            owner: req.user._id, 
        });

        res.status(201).json({
            success: true,
            message: "Futsal created!",
            data: futsal,
        });
    } catch (error) {
        next(error);
    }
};

const getAllFutsals = async (req, res, next) => {
    try {
        const filter = { isActive: true };
        if (req.query.city) {
            filter.city = String(req.query.city); 
        }

        const futsals = await Futsal.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: futsals });
    } catch (error) {
        next(error);
    }
};

const getMyFutsals = async (req, res, next) => {
    try {
        const futsals = await Futsal.find({
            owner: req.user._id,
            isActive: true,
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: futsals });
    } catch (error) {
        next(error);
    }
};

const getFutsalById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid Futsal Id!"));
        }

        const futsal = await Futsal.findOne({ _id: id, isActive: true }).populate(
            "owner",
            "name phone"
        );

        if (!futsal) {
            return next(createHttpError(404, "Futsal not found!"));
        }

        res.status(200).json({ success: true, data: futsal });
    } catch (error) {
        next(error);
    }
};

const updateFutsal = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid Futsal Id!"));
        }

        const futsal = await Futsal.findOne({ _id: id, isActive: true });

        if (!futsal) {
            return next(createHttpError(404, "Futsal not found!"));
        }

        if (futsal.owner.toString() !== req.user._id.toString()) {
            return next(createHttpError(403, "You can only edit your own futsal!"));
        }

        for (const field of ["name", "description", "phone", "address", "city"]) {
            if (req.body[field] !== undefined) {
                futsal[field] = req.body[field];
            }
        }

        await futsal.save();

        res.status(200).json({
            success: true,
            message: "Futsal updated!",
            data: futsal,
        });
    } catch (error) {
        next(error);
    }
};

const deleteFutsal = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(400, "Invalid Futsal Id!"));
        }

        const futsal = await Futsal.findOne({ _id: id, isActive: true });

        if (!futsal) {
            return next(createHttpError(404, "Futsal not found!"));
        }

        const isOwner = futsal.owner.toString() === req.user._id.toString();
        const isAdminUser = req.user.role === "admin";

        if (!isOwner && !isAdminUser) {
            return next(createHttpError(403, "Not allowed to delete this futsal!"));
        }

        futsal.isActive = false;
        await futsal.save();

        res.status(200).json({
            success: true,
            message: "Futsal deleted!",
        });
    } catch (error) {
        next(error);
    }
};

export { createFutsal, getAllFutsals, getMyFutsals, getFutsalById, updateFutsal, deleteFutsal };


