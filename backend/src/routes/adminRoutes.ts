import { Router } from 'express';

import {
  banUser,
  getAllUsers,
  getStats,
  unbanUser,
} from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(protect, requireRole('admin'));

router.put('/ban/:userId', banUser);
router.put('/unban/:userId', unbanUser);
router.get('/users', getAllUsers);
router.get('/stats', getStats);

export default router;
