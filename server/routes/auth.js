import { Router } from 'express';
import passport from 'passport';
import { isAuthenticated, isNotAuthenticated } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * POST /auth/login:
 */
router.post('/login', isNotAuthenticated, passport.authenticate('local'), (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, username: req.user.username },
  });
});

/**
 * @swagger
 * POST /auth/logout:
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
 * GET /auth/status:
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
