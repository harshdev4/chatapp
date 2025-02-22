import express from 'express';
import { amILoggedIn, fetchSelectedUser, fetchUsers, login, logout, register, uploadProfileImage } from '../controllers/User.js';
import upload from '../config/multerConfig.js';
import { protectedRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', upload.single("profilePic"), register);
router.post('/login', login);
router.get('/fetchUsers', protectedRoute, fetchUsers);
router.get('/amILoggedIn', protectedRoute, amILoggedIn);
router.get('/fetchSelectedUser/:id', protectedRoute, fetchSelectedUser);
router.post('/uploadProfileImage/', protectedRoute, upload.single("profilePic"), uploadProfileImage);
router.get('/logout', protectedRoute, logout);

export default router;