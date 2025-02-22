import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

export const protectedRoute = async (req, res, next)=>{
    try {
        const token = req.cookies.access_token;
        
        if (!token) {
            return res.status(401).json({message: 'Unauthorized - No Token Provided'});
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decode.user.userId);
        const userWithProfile = {
            userId: decode.user.userId,
            username: decode.user.username,
            name: decode.user.name,
            profilePic: user.profilePic
        }
        
        req.user = userWithProfile;
        next();
    } catch (error) {
        console.log("Error in protected route middleware:", error);
        return res.status(500).json({message: 'Server Error'});
    }
}