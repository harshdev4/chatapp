import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const generateToken = (tokenUser)=>{
    return jwt.sign({user:tokenUser}, process.env.SECRET_KEY, { expiresIn: '7d' });
} 