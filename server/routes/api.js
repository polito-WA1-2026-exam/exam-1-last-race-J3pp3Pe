import { Router } from 'express';
import {
  getAllStations,
  createGame,
  getGameById,
  updateGameResult,
  getUserRankings,
  getRandomEvent,
} from '../db.js';
import { getNetwork } from '../dao.js';
import { validateRoute, calculateMinDistance } from '../utils/validation.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/network:
 *   get:
 *     summary: Get metro network data
 *     description: Returns all lines, stations, and segments forming the metro network
 *     tags: [Network]
 *     security: []
 *     responses:
 *       200:
 *         description: Metro network data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lines:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Line'
 *                 stations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Station'
 *                 segments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segment'
 *       500:
 *         description: Failed to fetch network data
 */
router.get('/network', async (req, res) => {
  try {
    const data = await getNetwork();
    res.json(data);
  } catch (error) {
    console.error('Error fetching network:', error);
    res.status(500).json({ error: 'Failed to fetch network data' });
  }
});

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user info
 *     description: Returns information about the currently authenticated user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
  });
});

/**
 * @swagger
 * /api/game/new:
 *   get:
 *     summary: Start a new game
 *     description: Creates a new game session with random start and destination stations (min 3 segments apart)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: New game created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameId:
 *                   type: integer
 *                 startStation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 destinationStation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 initialCoins:
 *                   type: integer
 *                   example: 20
 *                 timeLimit:
 *                   type: integer
 *                   example: 90
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Failed to create game
 */
router.get('/game/new', isAuthenticated, async (req, res) => {
  try {
    const stations = await getAllStations();

    if (stations.length < 2) {
      return res.status(500).json({ error: 'Not enough stations in database' });
    }

    let startStation, destinationStation;
    let distance;

    // Find random stations with minimum 3 segments distance
    do {
      startStation = stations[Math.floor(Math.random() * stations.length)];
      destinationStation = stations[Math.floor(Math.random() * stations.length)];
      distance = await calculateMinDistance(startStation.id, destinationStation.id);
    } while (
      startStation.id === destinationStation.id ||
      distance < 3
    );

    const gameId = await createGame(req.user.id, startStation.id, destinationStation.id);

    res.json({
      gameId,
      startStation: { id: startStation.id, name: startStation.name },
      destinationStation: { id: destinationStation.id, name: destinationStation.name },
      initialCoins: 20,
      timeLimit: 90,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

/**
 * @swagger
 * /api/game/play:
 *   post:
 *     summary: Submit and execute route
 *     description: Validates and executes the submitted route, applies random events to coins, returns final score
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: integer
 *                 example: 1
 *               segments:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4]
 *             required:
 *               - gameId
 *               - segments
 *     responses:
 *       200:
 *         description: Game executed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameId:
 *                   type: integer
 *                 isValid:
 *                   type: boolean
 *                 reason:
 *                   type: string
 *                   description: "If invalid route, explains why"
 *                 finalScore:
 *                   type: integer
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GameEvent'
 *       400:
 *         description: Missing gameId or segments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to play this game
 *       404:
 *         description: Game not found
 *       500:
 *         description: Failed to execute game
 */
router.post('/game/play', isAuthenticated, async (req, res) => {
  try {
    const { gameId, segments } = req.body;

    if (!gameId || !segments) {
      return res.status(400).json({ error: 'Missing gameId or segments' });
    }

    const game = await getGameById(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to play this game' });
    }

    // Validate route
    const validation = await validateRoute(
      game.start_station_id,
      game.destination_station_id,
      segments,
      gameId
    );

    if (!validation.valid) {
      // Invalid route = score 0
      await updateGameResult(gameId, segments, false, 0);
      return res.json({
        gameId,
        isValid: false,
        reason: validation.reason,
        finalScore: 0,
        events: [],
      });
    }

    // Valid route - execute
    let currentCoins = 20;
    const events = [];

    for (let i = 0; i < segments.length; i++) {
      const segmentId = segments[i];
      const event = await getRandomEvent();

      const coinsBefore = currentCoins;
      currentCoins += event.coin_effect;
      currentCoins = Math.max(0, currentCoins); // Coins can't go below 0

      events.push({
        segmentId,
        event: event.description,
        coinEffect: event.coin_effect,
        coinsAfter: currentCoins,
      });
    }

    const finalScore = Math.max(0, currentCoins);
    await updateGameResult(gameId, segments, true, finalScore);

    res.json({
      gameId,
      isValid: true,
      finalScore,
      events,
    });
  } catch (error) {
    console.error('Error playing game:', error);
    res.status(500).json({ error: 'Failed to execute game' });
  }
});

/**
 * @swagger
 * /api/rankings:
 *   get:
 *     summary: Get user rankings
 *     description: Returns leaderboard with all users sorted by best score and game count
 *     tags: [Rankings]
 *     responses:
 *       200:
 *         description: User rankings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rankings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ranking'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Failed to fetch rankings
 */
router.get('/rankings', isAuthenticated, async (req, res) => {
  try {
    const rankings = await getUserRankings();
    res.json({ rankings });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

export default router;
