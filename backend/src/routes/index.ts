import { Router } from 'express';
import authRoutes from './auth'
import barRoutes from './bar'
import eventRoutes from './event'
import groupRoutes from './group'
import participantRoutes from './participants'
import stopRoutes from './stop'
import userRoutes from './user'
import { authMiddleware } from '../middleware/auth_middleware'

const router = Router();

router.use('/auth', authRoutes);
router.use('/bar', barRoutes);
router.use('/event', eventRoutes);
router.use('/group', groupRoutes);
router.use('/participant', participantRoutes)
router.use('/stop', stopRoutes);
router.use('/user', userRoutes);

export default router;