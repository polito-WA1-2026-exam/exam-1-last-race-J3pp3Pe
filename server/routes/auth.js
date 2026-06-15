import { Router } from 'express';
import passport from 'passport';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with credentials
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', isNotAuthenticated, passport.authenticate('local'), (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, username: req.user.username },
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags:
 *       - Auth
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Get authentication status
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: { id: req.user.id, username: req.user.username },
    });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
