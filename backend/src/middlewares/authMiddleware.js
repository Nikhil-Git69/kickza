import User from "../models/User.js";
import config from "../utils/config.js";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

const isVerifiedUser = async(req, res, next) =>{
    try{
        const {accessToken} = req.cookies;
        if(!accessToken){
            const error = createHttpError(401, "Access token is missing");
            return next(error);
        }
        
        const decodedToken = jwt.verify(accessToken, config.accessTokenSecret);
        const user = await User.findById(decodedToken._id);
        if(!user){
            const error = createHttpError(401, "User not found");
            return next(error);
        }


        req.user = user;
        next();


        
    }
    catch(error){
        const err = createHttpError(401, "Invalid access token");
        next(err);
    }
}

export default isVerifiedUser;