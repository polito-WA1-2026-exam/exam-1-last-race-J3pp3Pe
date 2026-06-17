import React, { useContext, useEffect, useState, useRef } from 'react'; // Lägg till useRef
import { useLocation, useNavigate } from 'react-router-dom';
import GameContext from '../contexts/GameContext.jsx';

export default function ExecutePage() {
  const { currentGame, playGame } = useContext(GameContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  
  // NYTT: En ref för att spåra om vi redan har anropat API:et
  const hasExecuted = useRef(false);

  useEffect(() => {
    const executeGame = async () => {
      // NYTT: Avbryt direkt om vi redan har kört funktionen
      if (hasExecuted.current) return;
      hasExecuted.current = true;

      try {
        setExecuting(true);
        const route = location.state?.route;
        const gameId = location.state?.gameId;

        if (!route || !gameId) {
          setError('No route or game data');
          return;
        }

        const gameResult = await playGame(route, gameId);
        setResult(gameResult);

        // If invalid route, navigate to result immediately
        if (!gameResult.isValid) {
          setTimeout(() => {
            navigate('/result', { state: { result: gameResult } });
          }, 2000);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setExecuting(false);
      }
    };

    executeGame();
  }, []);

  // Auto-progress through events
  useEffect(() => {
    if (!result?.isValid || !result?.events) return;

    if (currentEventIndex < result.events.length - 1) {
      const timer = setTimeout(() => {
        setCurrentEventIndex((prev) => prev + 1);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentEventIndex, result]);

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        Error executing game: {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        <p>Executing your route...</p>
      </div>
    );
  }

  if (!result.isValid) {
    return (
      <div className="mt-4">
        <div className="alert alert-danger">
          <h4>❌ Invalid Route</h4>
          <p>{result.reason}</p>
          <p className="mb-0 mt-3">
            <strong>Score: 0 coins</strong>
          </p>
        </div>
        <div className="text-center mt-4">
          <p className="text-muted">Redirecting to results...</p>
        </div>
      </div>
    );
  }

  const displayedEvents = result.events.slice(0, currentEventIndex + 1);

  return (
    <div>
      <h2>Journey Execution</h2>
      <p className="text-muted">Traveling through the metro network...</p>

      <div className="row mt-4">
        <div className="col-lg-8 offset-lg-2">
          {/* Current coins display */}
          <div className="card mb-4">
            <div className="card-body text-center">
              <p className="text-muted mb-0">Current Coins</p>
              <div className="fw-bold text-warning" style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>
                {displayedEvents.length > 0
                  ? displayedEvents[displayedEvents.length - 1].coinsAfter
                  : 20}
              </div>
            </div>
          </div>

          {/* Events */}
          {displayedEvents.map((event, index) => {
            const isPositive = event.coinEffect > 0;
            const isNegative = event.coinEffect < 0;
            const borderClass = isPositive
              ? 'border-success-subtle'
              : isNegative
                ? 'border-danger-subtle'
                : 'border-warning-subtle';

            return (
              <div key={index} className={`card mb-3 border-start border-4 ${borderClass}`}>
                <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1">
                      <strong>Step {index + 1}:</strong> {event.event}
                    </p>
                    <small className="text-muted">
                      Coins: {event.coinEffect > 0 ? '+' : ''}{event.coinEffect}
                    </small>
                  </div>
                  <div className="text-end">
                    <small>
                      <strong>{event.coinsAfter}</strong> coins
                    </small>
                  </div>
                </div>
                </div>
              </div>
            );
          })}

          {currentEventIndex < result.events.length - 1 && (
            <div className="text-center mt-4">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <p className="mt-2 text-muted">
                Processing segment {currentEventIndex + 2} of {result.events.length}...
              </p>
            </div>
          )}

          {currentEventIndex >= result.events.length - 1 && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/result', { state: { result } })}
              >
                Go to result
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
