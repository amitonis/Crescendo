import { Router } from 'express';

import {
  createTrack,
  deleteTrack,
  getAllTracks,
  getArtistTracks,
  getSignedUploadUrl,
  getTrackById,
  updateTrack,
} from '../controllers/trackController';
import { optionalAuth, protect } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', getAllTracks);
router.get('/artist/:artistId', getArtistTracks);
router.get('/:id', optionalAuth, getTrackById);
router.post('/', protect, requireRole('artist'), createTrack);
router.put('/:id', protect, requireRole('artist'), updateTrack);
router.delete('/:id', protect, requireRole('artist'), deleteTrack);
router.post('/signed-url', protect, requireRole('artist'), getSignedUploadUrl);

export default router;
