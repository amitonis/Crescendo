import { Router } from 'express';

import { getMe, login, logout, register } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;

