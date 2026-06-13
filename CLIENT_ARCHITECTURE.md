# Last Race - Client Architecture

## Structure (Week 11 Pattern)

```
client/src/
├── App.jsx                    # Main app with routing
├── App.css                    # Global styles
├── main.jsx                   # Entry point (React 19, StrictMode)
├── index.css                  # Base CSS
├── api/                       # API layer
│   ├── auth.js               # Authentication endpoints
│   └── api.js                # Game API endpoints
├── contexts/                  # State management
│   ├── UserContext.js        # User auth state
│   └── GameContext.js        # Game state
├── models/                    # Data models
│   └── GameModels.js         # Game data classes
├── components/                # Reusable components
│   ├── Header.jsx            # Navigation header
│   ├── PrivateRoute.jsx      # Protected route wrapper
│   └── NetworkVisualization.jsx # Metro network SVG
└── pages/                     # Page components
    ├── LoginPage.jsx         # Login form
    ├── InstructionsPage.jsx  # Game instructions
    ├── SetupPage.jsx         # Network setup view
    ├── PlanPage.jsx          # Route planning (90s timer)
    ├── ExecutePage.jsx       # Route execution
    ├── ResultPage.jsx        # Final score
    └── RankingsPage.jsx      # Leaderboard
```

## Architecture Layers

### 1. **API Layer** (api/)
- `auth.js`: Login, logout, status checks
- `api.js`: Game endpoints, network data, rankings
- Error handling with descriptive messages
- Uses `credentials: 'include'` for session cookies

### 2. **State Management** (contexts/)
- **UserContext**: Authenticated user, login/logout
- **GameContext**: Current game, network data, rankings, loading state
- Providers wrap the app for global access

### 3. **Data Models** (models/)
- User, Station, Line, Segment classes
- Game, GameResult, Ranking models
- Type-safe data structures

### 4. **Components** (components/)
- **Header**: Navigation with user info
- **PrivateRoute**: Auth-protected routes
- **NetworkVisualization**: SVG metro network rendering

### 5. **Pages** (pages/)
- **LoginPage**: Credentials entry, test user display
- **InstructionsPage**: Game rules & mechanics
- **SetupPage**: Network overview before game
- **PlanPage**: Route building with 90s timer
- **ExecutePage**: Sequential event display with coins
- **ResultPage**: Final score & replay/rankings
- **RankingsPage**: Leaderboard with ranking badges

## Routes & Navigation

```
/ (public)                    → LoginPage
/instructions (public)        → InstructionsPage
/setup (protected)           → SetupPage
/plan (protected)            → PlanPage (90s timer)
/execute (protected)         → ExecutePage (events)
/result (protected)          → ResultPage
/rankings (protected)        → RankingsPage
```

## Key Features

✅ **React 19** with Strict Mode  
✅ **React Router v7** for SPA navigation  
✅ **Bootstrap 5** for UI components  
✅ **Context API** for state management  
✅ **Promise-based API calls** with error handling  
✅ **SVG network visualization** with station/line rendering  
✅ **90-second countdown timer** with visual warning  
✅ **Session-based authentication** (cookies)  
✅ **Responsive card-based layout**  
✅ **Event animations** during route execution  
✅ **Real-time coin tracking**  
✅ **Leaderboard with ranking medals**  

## Styling

- Custom CSS in `App.css` with Bootstrap integration
- Color scheme: Purple gradient (`#667eea` to `#764ba2`)
- Orange accent for coins (`#f77f00`)
- Smooth animations and transitions
- Event cards color-coded (green=positive, red=negative)
- Responsive grid layouts

## Data Flow

1. **Login** → UserContext stores authenticated user
2. **Setup** → GameContext loads network from API
3. **New Game** → API creates game, assigns start/destination
4. **Planning** → User selects segments over 90 seconds
5. **Execution** → API validates and executes route with random events
6. **Result** → Display final score, offer replay or rankings view
7. **Rankings** → Fetch and display all user rankings

## Session Management

- Passport.js sessions with cookies
- `credentials: 'include'` on all API calls
- Protected routes check UserContext.user
- Auto-redirect to login if not authenticated
- Auth status checked on app startup

## Error Handling

- Try-catch blocks on all async operations
- User-friendly error messages
- Validation at component level
- Network error recovery suggestions
- Loading states during async operations

## Performance

- Code-split pages with React Router
- No unnecessary re-renders with Context
- SVG rendering for network (scalable)
- Event animations with CSS keyframes
- Minimal bundle size with Bootstrap CDN

## Testing Credentials

```
alice / password1
bob / password2
charlie / password3
```

Each has different game histories in the rankings.
