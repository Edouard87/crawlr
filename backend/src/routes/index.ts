import { Router } from 'express';
import barRoutes from './bar'
import participantRoutes from './participants'
import { authMiddleware } from '../middleware/auth_middleware'

const router = Router();

router.use('/bar', barRoutes);
router.use('/participant', participantRoutes)

export default router;