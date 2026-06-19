import { Router } from 'express';

import {
    changePassword,
  getProfile,
  updateProfile,
} from '@/controllers/user.controller';
import { protect } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfile);
router.patch('/chnage-password', changePassword);

export default router;