import User from "../models/User.js";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import express from 'express';
import { generateToken } from "../utils/jwt.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { compressImage } from "../utils/compressImage.js";

dotenv.config();
const SALT_ROUND = parseInt(process.env.SALT_ROUND,10);

export const register = async (req, res)=>{
    let {username, name, password} = req.body;

    if (!username || !name || !password || !req.file) {
        return res.status(400).json({message: 'All fields are required'});
    }
    if (password.length < 8) {
        return res.status(400).json({message: 'Password must be atleast 8 characters long'});
    }
    username = username.trim();
    name = name.trim();
    name = name.slice(0,1).toUpperCase() + name.slice(1,);
    try {
        const userExist = await User.findOne({username});
        if (userExist) {
            return res.status(409).json({message: 'Username is already taken'});
        }
        const encrypt_password = await bcrypt.hash(password, SALT_ROUND);
        const buffer = await compressImage(req.file.buffer)
        const result = await uploadToCloudinary(buffer);
        const user = await User.create({username, name, password: encrypt_password, profilePic: result.secure_url});
        const tokenUser = {
            userId: user._id,
            username,
            name,
            profilePic: user.profilePic,
            joined: user.timestamp
        };
        const token = generateToken(tokenUser);
        res.cookie('access_token', token, {maxAge: 7*24*60*60*1000, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax'})
        return res.status(200).json({message: 'User signed in success', user: tokenUser});
    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error});
    }
}

export const login = async (req, res)=>{
    let {username, password} = req.body;
    
    if (!username || !password) {
        return res.status(400).json({message: 'All fields are required'});
    }

    try {
        const user = await User.findOne({username});
        if (user) {
            const compare_password = await bcrypt.compare(password, user.password);
            if (compare_password) {
                const tokenUser = {
                    userId: user._id,
                    username,
                    name: user.name,
                    profilePic: user.profilePic,
                    joined: user.timestamp
                };
                const token = generateToken(tokenUser);
                res.cookie('access_token', token, {maxAge: 7*24*60*60*1000, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'})
                return res.status(200).json({message: 'User logged in success', user: tokenUser});
            }
            else{
                return res.status(401).json({message: 'Account not found'});
            }
        }
        else{
            return res.status(401).json({message: 'Account not found'});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Something went wrong', error});
    }
}

export const fetchUsers = async (req, res) =>{
    try {
        const users = await User.find({ _id: { $ne: req.user.userId } });

        return res.status(200).json({users});
    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error});
    }
}

export const amILoggedIn = async (req, res) =>{
    try {
        const user = req.user;
        return res.status(200).json({isLoggedIn: true, user});
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export const fetchSelectedUser = async (req, res)=>{
    try {
        const userId = req.params.id;
        
        const user = await User.findById(userId).select('-password -timestamp');
        const tempUser = {
            userId: user._id,
            username: user.username,
            profilePic: user.profilePic,
            name: user.name,
            socketId: user.socketId
        }
        
        if (!user) {
            return res.status(401).json({message: 'No user found'});
        }
        return res.status(200).json({user: tempUser});
    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error});
    }
}

export const uploadProfileImage = async (req, res)=>{
    try {
        if (!req.file) {
            return res.status(401).json({message: "No Image Provided"});
        }
        const userId = req.user.userId;
        const user = await User.findById(userId);
        let oldPublicId;
        if (user.profilePic) oldPublicId = user.profilePic.split('/').pop().split('.')[0]
        const buffer = await compressImage(req.file.buffer);
        const result = await uploadToCloudinary(buffer);
        if (oldPublicId) await cloudinary.uploader.destroy(`chatapp/${oldPublicId}`);
        await User.findByIdAndUpdate(userId,{profilePic: result.secure_url});
        res.status(200).json({userProfile:user.result.secure_url});
    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error});
    }
}

export const logout = async (req, res)=>{
    try {
        const userId = req.user.userId;
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        return res.status(200).json({message: 'logout success'});
    } catch (error) {
        return res.status(500).json({message: 'Something went wrong', error});
    }
}