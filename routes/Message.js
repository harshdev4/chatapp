import express from 'express';
import { fetchMessages, latestMessage } from '../controllers/Message.js';
import { protectedRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/fetchMessages', protectedRoute, fetchMessages);
router.get('/latestMessage/:id', protectedRoute, latestMessage);

export default router;