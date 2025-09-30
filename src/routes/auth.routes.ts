import { Router } from 'express';
import { registerUser } from '../auth/controller';

// Initialize the Express router
const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Public route to create a new user account.
 */
router.post('/register', registerUser);

// You can add other authentication routes here, like '/login', '/forgot-password', etc.

export default router;
