import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import bcryptjs from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './swagger.js';
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import * as dao from './dao.js';
import { connectDatabase } from './db.js';

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

    // Routes
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);

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