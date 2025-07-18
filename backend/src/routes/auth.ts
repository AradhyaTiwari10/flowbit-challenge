import { Router } from 'express';
import { AuthController, loginValidation, refreshTokenValidation } from '@/controllers/authController';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshTokenValidation, AuthController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot password
 * @access  Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

export default router; 