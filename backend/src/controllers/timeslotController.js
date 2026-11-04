    import mongoose from "mongoose";
    import createHttpError from "http-errors";
    import TimeSlot from "../models/TimeSlot.js";
    import Court from "../models/Court.js";
    
    
    const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

    const createTimeSlot = async (req, res, next) => {
        try{
            const { courtId, startTime, endTime, price, days } = req.body;

            if (!courtId || !startTime || !endTime || price === undefined) {
                return next(createHttpError(400, "courtId, startTime, endTime, and price are required!"));
            }
            if (days !== undefined && (!Array.isArray(days) || days.length === 0)) {
               return next(createHttpError(400, "days must be a non-empty array of numbers 0-6!"));
            }
            if (days !== undefined && (new Set(days).size !== days.length || !days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6))){
                return next(createHttpError(400, "days must be unique whole numbers from 0 to 6!"));
            }

            const effectiveDays = days ?? [0, 1, 2, 3, 4, 5, 6];
            if(!mongoose.Types.ObjectId.isValid(courtId)){
                return next(createHttpError(400, "Invalid courtId!"));
            }
            if (typeof price !== 'number' || price < 0) {
                return next(createHttpError(400, "Price must be a non-negative number!"));
            }

            if (
                typeof startTime !== "string" || typeof endTime !== "string" ||
                !TIME_FORMAT.test(startTime) || !TIME_FORMAT.test(endTime)
            ) {
                return next(createHttpError(400, "Times must be HH:mm (24-hour)!"));
            }
            if (startTime >= endTime) {
                return next(createHttpError(400, "endTime must be after startTime!"));
            }

            const court = await Court.findOne({ _id: courtId, isActive: true }).populate('futsal');

            if (!court || !court.futsal || !court.futsal.isActive) {
                return next(createHttpError(404, "Court not found!"));
            }
            if (court.futsal.owner.toString() !== req.user._id.toString()) {
            return next(createHttpError(403, "You can only add timeslots to your own courts!"));
            }   

            const overlapping = await TimeSlot.findOne({
                court: courtId,
                isActive: true,
                days: { $in: effectiveDays },
                startTime: { $lt: endTime },   // existing start < new end
                endTime: { $gt: startTime },   // existing end   > new start
            }   );

            if (overlapping) {
                return next(createHttpError(409, "This time slot overlaps with an existing slot!"));
            }

            const timeSlot = await TimeSlot.create({
                court: courtId,
                startTime,
                endTime, 
                days: effectiveDays,
                price
            });

            res.status(201).json({
                success: true,
                message: "Time slot created!",
                data: timeSlot,
            }); 


        }
        catch(error){
            next(error);
        }
    }


    const getTimeSlotsByCourtId = async (req, res, next) => {
        try{
            const {courtId} = req.params;

            if (!mongoose.Types.ObjectId.isValid(courtId)) {
                return next(createHttpError(400, "Invalid courtId!"));
            }

            const court = await Court.findOne({ _id: courtId, isActive: true }).populate('futsal');

            if (!court || !court.futsal || !court.futsal.isActive) {
                return next(createHttpError(404, "Court not found!"));
            }

            const timeSlots = await TimeSlot.find({ court: courtId, isActive: true }).sort({ startTime: 1 })

            res.status(200).json({ success: true, data: timeSlots });   
        }
        catch(error){
            next(error);
        }
    }


    const deleteTimeSlot = async (req, res, next) => {
        try{
            const {id} = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(createHttpError(400, "Invalid timeSlotId!"));
            }

            const timeSlot = await TimeSlot.findOne({ _id: id, isActive: true });

            if (!timeSlot) {
                return next(createHttpError(404, "Time slot not found!"));
            }

            const court = await Court.findOne({ _id: timeSlot.court, isActive: true }).populate("futsal");

            if (!court || !court.futsal || !court.futsal.isActive) {
                return next(createHttpError(404, "Court not found!"));
            }

            const isOwner = court.futsal.owner.toString() === req.user._id.toString();
            

            if(!isOwner){
                return next(createHttpError(403, "Not allowed to delete this timeslot!"));
            }

            timeSlot.isActive = false;
            await timeSlot.save();

            res.status(200).json({
                success: true,
                message: "Time slot deleted!",
            }); 
        }
        catch(error){
            next(error);
        }   
    }

    export { createTimeSlot, getTimeSlotsByCourtId, deleteTimeSlot };