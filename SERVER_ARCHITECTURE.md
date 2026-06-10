# Last Race - Server Architecture

## Structure (Week 11 Pattern)

```
server/
├── index.js           # Main entry point, all routes consolidated here
├── dao.js             # Data Access Object layer (all database operations)
├── db.js              # Database initialization & connection
├── Models.js          # Data model classes
├── swagger.js         # Swagger/OpenAPI configuration
├── utils/
│   └── validation.js  # Route validation logic (pathfinding, validation)
└── package.json       # Dependencies
```

## Key Architectural Patterns

### 1. **index.js** - Route Layer
- Consolidates ALL routes (auth, game, network, rankings)
- Middleware setup (cors, morgan, passport, swagger-ui)
- Uses DAO layer for data access
- Inline JSDoc comments for Swagger documentation

### 2. **dao.js** - Data Access Layer
- Wraps all database operations in Promises
- Functions for users, games, segments, events, rankings
- Clean separation between routes and data access
- All database logic centralized

### 3. **db.js** - Database Layer
- SQLite3 initialization
- Promise wrappers for callback-based sqlite3 API
- Database seeding with Gothenburg metro network
- Connection management

### 4. **Models.js** - Data Models
- User, Station, Line, Segment classes
- Game, GameEvent, GameExecutionEvent classes
- Ranking model
- Shared between serialization/deserialization

### 5. **swagger.js** - API Documentation
- OpenAPI 3.0 specification
- Auto-generates from JSDoc comments in index.js
- Available at: `http://localhost:3001/docs`

### 6. **utils/validation.js** - Business Logic
- Route validation (continuous path, line changes)
- BFS pathfinding for minimum distance
- Reachability checking

## API Endpoints (8 total)

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout
- `GET /auth/status` - Check auth status

### Network (Public)
- `GET /api/network` - Get metro network

### Game (Protected)
- `GET /api/me` - Current user info
- `GET /api/game/new` - Start new game
- `POST /api/game/play` - Submit route, execute game
- `GET /api/rankings` - User rankings

## Database Schema

```
users - User accounts
lines - Metro lines (5)
stations - Metro stations (13+)
line_stations - Line-station associations
segments - Station connections (bidirectional)
events - Random events for journey (9)
games - Game sessions
game_segments - Execution tracking per segment
```

## Key Technologies

- **Express 5.2** - Web framework
- **Passport.js** - Authentication
- **SQLite3** - Database
- **Swagger/OpenAPI** - API documentation
- **Morgan** - HTTP logging
- **Express-validator** - Input validation
- **bcryptjs** - Password hashing

## Session Management

- Express-session with in-memory store
- Passport serialization/deserialization
- Cookie-based authentication
- CORS configured for localhost:5173 (Vite)

## Seeded Test Data

**Users:**
- alice / password1
- bob / password2
- charlie / password3

**Network:**
- 5 lines (Red, Green, Blue, Yellow, Purple)
- 13 Gothenburg stations
- 3 interchange stations (Centralen, Korsvägen, Hjalmar Brantingsplatsen)

**Events (9):**
- Quiet journey (0)
- Wrong platform (-2)
- Kind passenger (+1)
- Found coins (+2)
- Door malfunction (-1)
- Tourist asks (-0)
- Service interruption (-3)
- Lucky draw (+3)
- Station noise (-1)

## Running the Server

```bash
cd server
npm install
nodemon index.js
```

Access Swagger docs at: `http://localhost:3001/docs`
