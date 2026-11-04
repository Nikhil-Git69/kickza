import User from "../models/User.js";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import config from "../utils/config.js";
import mongoose from "mongoose";


const register = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body;

        if (!name || !phone || !email || !password) {
            return next(
                createHttpError(
                    400,
                    "Name, phone, email and password are required!"
                )
            );
        }

        const isUserPresent = await User.findOne({ email });

        if (isUserPresent) {
            return next(createHttpError(400, "User already exists!"));
        }


        const newUser = new User({
            name,
            phone,
            email,
            password,
            role: role || "user",
        });

        await newUser.save();

        const userData = newUser.toObject();
        delete userData.password;

        res.status(201).json({
            success: true,
            message: "New User created!",
            data: userData,
        });

    } catch (error) {
        next(error);
    }
};




const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(
                createHttpError(400, "Email and password are required!")
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(
                createHttpError(401, "Invalid credentials!")
            );
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(
                createHttpError(401, "Invalid credentials!")
            );
        }

        const accessToken = jwt.sign(
            { _id: user._id },
            config.accessTokenSecret,
            {
                expiresIn: "1d",
            }
        );

        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        const userData = user.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: "User logged in successfully!",
            data: userData,
        });

    } catch (error) {
        next(error);
    }
};




const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return next(
                createHttpError(404, "User not found!")
            );
        }

        res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        next(error);
    }
};




const getAllUserData = async (req, res, next) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            success: true,
            message: "Fetched all users data",
            data: users,
        });

    } catch (error) {
        next(error);
    }
};



const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const userId = req.user._id.toString();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(
                createHttpError(400, "Invalid User Id!")
            );
        }

        if (id === userId) {
            return next(
                createHttpError(
                    400,
                    "You cannot delete your own account!"
                )
            );
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return next(
                createHttpError(404, "User not found!")
            );
        }

        res.status(200).json({
            success: true,
            message: "User successfully deleted!",
        });

    } catch (error) {
        next(error);
    }
};




const logout = async (req, res, next) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully!",
        });

    } catch (error) {
        next(error);
    }
};


export { register, login, getUserData, getAllUserData, deleteUser, logout};