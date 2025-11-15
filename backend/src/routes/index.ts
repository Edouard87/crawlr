import { Router } from 'express';
import authRoutes from './auth'
import barRoutes from './bar'
import eventRoutes from './event'
import participantRoutes from './participants'
import { authMiddleware } from '../middleware/auth_middleware'

const router = Router();

router.use('/auth', authRoutes);
router.use('/bar', barRoutes);
router.use('/participant', participantRoutes)

export default router;