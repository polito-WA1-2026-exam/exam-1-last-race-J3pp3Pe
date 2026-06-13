import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameContext from '../contexts/GameContext.jsx';

export default function ResultPage() {
  const { startGame, resetCurrentGame } = useContext(GameContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const result = location.state?.result;

  const handlePlayAgain = async () => {
    try {
      setLoading(true);
      resetCurrentGame();
      await startGame();
      navigate('/plan');
    } catch (error) {
      console.error('Error starting new game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRankings = () => {
    navigate('/rankings');
  };

  if (!result) {
    return (
      <div className="text-center py-5">
        <p>No game result available</p>
      </div>
    );
  }

  const emoji = result.finalScore >= 20 ? '🎉' : result.finalScore >= 10 ? '😊' : '😢';

  return (
    <div>
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-5 text-center">
              <h2 className="mb-4">Game Complete!</h2>

              {result.isValid ? (
                <>
                  <div style={{ fontSize: '4rem' }}>{emoji}</div>
                  <div className="fw-bold text-primary my-4" style={{ fontSize: '3rem' }}>
                    {result.finalScore}
                  </div>
                  <p className="text-muted mb-0">coins earned</p>

                  <div className="mt-5 pt-4 border-top">
                    <h5>Journey Summary</h5>
                    <p className="text-muted">
                      You traveled through <strong>{result.events.length}</strong> segments and
                      encountered <strong>{result.events.length}</strong> events
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '4rem' }}>❌</div>
                  <h4 className="mt-3">Route Invalid</h4>
                  <p className="text-muted">{result.reason}</p>
                  <div className="fw-bold text-primary my-4" style={{ fontSize: '3rem' }}>0</div>
                  <p className="text-muted mb-0">coins earned</p>
                </>
              )}

              <div className="mt-5 pt-4 border-top d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handlePlayAgain}
                  disabled={loading}
                >
                  {loading ? 'Starting...' : '🎮 Play Again'}
                </button>
                <button
                  className="btn btn-outline-primary btn-lg"
                  onClick={handleViewRankings}
                >
                  🏆 View Rankings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
