import { Router } from 'express';

import { getMyEarnings, getMyPurchases, purchaseTrack } from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.post('/purchase', protect, purchaseTrack);
router.get('/my-purchases', protect, getMyPurchases);
router.get('/my-earnings', protect, requireRole('artist'), getMyEarnings);

export default router;
