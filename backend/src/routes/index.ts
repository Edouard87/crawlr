import { Router } from 'express';
import barRoutes from './bar'
import { authMiddleware } from '../middleware/auth'

const router = Router();

router.use('/bar',  barRoutes);

export default router;