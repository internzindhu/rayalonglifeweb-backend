// Uploads router — kept for any future generic upload needs.
// Hotel image management has moved to /api/hotels/:hotelId/images

import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ message: 'Hotel image uploads are handled via /api/hotels/:hotelId/images' });
});

export default router;
