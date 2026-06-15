import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import bcryptjs from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';
import { check, validationResult } from 'express-validator';

import { swaggerSpec } from './swagger.js';
import authRouter from './routes/auth.js';
import * as dao from './dao.js';
import { connectDatabase } from './db.js';
import {
  calculateMinDistance,
  validateRoute,
} from './utils/validation.js';

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Authentication middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Passport configuration
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          const user = await dao.getUserByUsername(username);

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          const passwordMatch = bcryptjs.compareSync(password, user.password_hash);

          if (!passwordMatch) {
            return done(null, false, { message: 'Invalid password' });
          }

          return done(null, { id: user.id, username: user.username });
        } catch (error) {
          return done(error);
        }
      })
    );

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await dao.getUserById(id);
        if (user) {
          done(null, { id: user.id, username: user.username });
        } else {
          done(null, false);
        }
      } catch (error) {
        done(error);
      }
    });

    // Session configuration
    app.use(
      session({
        secret: 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: 'lax',
        },
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Swagger UI
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

    // ===== AUTHENTICATION ROUTES =====
    app.use('/auth', authRouter);


    // ===== NETWORK ROUTES =====

    /**
     * @swagger
     * /api/network:
     *   get:
     *     summary: Get metro network data
     *     tags: [Network]
     *     security: []
     *     responses:
     *       200:
     *         description: Metro network
     */
    app.get('/api/network', async (req, res) => {
      try {
        const data = await dao.getNetwork();
        res.json(data);
      } catch (error) {
        console.error('Error fetching network:', error);
        res.status(500).json({ error: 'Failed to fetch network data' });
      }
    });

    // ===== USER ROUTES =====

    /**
     * @swagger
     * /api/me:
     *   get:
     *     summary: Get current user info
     *     tags: [User]
     *     responses:
     *       200:
     *         description: Current user
     */
    app.get('/api/me', isLoggedIn, (req, res) => {
      res.json({
        id: req.user.id,
        username: req.user.username,
      });
    });

    // ===== GAME ROUTES =====

    /**
     * @swagger
     * /api/game/new:
     *   get:
     *     summary: Start a new game
     *     tags: [Game]
     *     responses:
     *       200:
     *         description: New game created
     */
    app.get('/api/game/new', isLoggedIn, async (req, res) => {
      try {
        const stations = await dao.getAllStations();

        if (stations.length < 2) {
          return res.status(500).json({ error: 'Not enough stations' });
        }

        let startStation, destinationStation;
        let distance;

        do {
          startStation = stations[Math.floor(Math.random() * stations.length)];
          destinationStation = stations[Math.floor(Math.random() * stations.length)];
          distance = await calculateMinDistance(startStation.id, destinationStation.id);
        } while (startStation.id === destinationStation.id || distance < 3);

        const gameId = await dao.createGame(
          req.user.id,
          startStation.id,
          destinationStation.id
        );

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
     *               segments:
     *                 type: array
     *                 items:
     *                   type: integer
     *     responses:
     *       200:
     *         description: Game executed
     */
    app.post('/api/game/play', isLoggedIn, async (req, res) => {
      try {
        const { gameId, segments } = req.body;

        if (!gameId || !segments) {
          return res.status(400).json({ error: 'Missing gameId or segments' });
        }

        const game = await dao.getGameById(gameId);

        if (!game) {
          return res.status(404).json({ error: 'Game not found' });
        }

        if (game.user_id !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized' });
        }

        const validation = await validateRoute(
          game.start_station_id,
          game.destination_station_id,
          segments,
          gameId
        );

        if (!validation.valid) {
          await dao.updateGameResult(gameId, segments, false, 0);
          return res.json({
            gameId,
            isValid: false,
            reason: validation.reason,
            finalScore: 0,
            events: [],
          });
        }

        let currentCoins = 20;
        const events = [];

        for (let i = 0; i < segments.length; i++) {
          const segmentId = segments[i];
          const event = await dao.getRandomEvent();

          const coinsBefore = currentCoins;
          currentCoins += event.coin_effect;
          currentCoins = Math.max(0, currentCoins);

          await dao.saveGameSegment(
            gameId,
            i,
            segmentId,
            event.id,
            coinsBefore,
            currentCoins
          );

          events.push({
            segmentId,
            event: event.description,
            coinEffect: event.coin_effect,
            coinsAfter: currentCoins,
          });
        }

        const finalScore = Math.max(0, currentCoins);
        await dao.updateGameResult(gameId, segments, true, finalScore);

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

    // ===== RANKINGS ROUTES =====

    /**
     * @swagger
     * /api/rankings:
     *   get:
     *     summary: Get user rankings
     *     tags: [Rankings]
     *     responses:
     *       200:
     *         description: User rankings
     */
    app.get('/api/rankings', isLoggedIn, async (req, res) => {
      try {
        const rankings = await dao.getUserRankings();
        res.json({ rankings });
      } catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({ error: 'Failed to fetch rankings' });
      }
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();