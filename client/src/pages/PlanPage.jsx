import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameContext from '../contexts/GameContext.jsx';
import UserContext from '../contexts/UserContext.jsx';
import NetworkVisualization from '../components/NetworkVisualization';
import * as gameApi from '../api/api.js';

export default function PlanPage() {
  const { currentGame, startGame, network, loadNetwork } = useContext(GameContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [game, setGame] = useState(currentGame);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [allSegments, setAllSegments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const initGame = async () => {
      if (!network) {
        await loadNetwork();
      }
      if (!game) {
        const newGame = await startGame();
        setGame(newGame);
      }
    };
    initGame();
  }, []);

  useEffect(() => {
    if (network?.segments) {
      setAllSegments(network.segments);
    }
  }, [network]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitRoute();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const toggleSegment = (segmentId) => {
    setSelectedSegments((prev) => {
      if (prev.includes(segmentId)) {
        return prev.filter((id) => id !== segmentId);
      } else {
        return [...prev, segmentId];
      }
    });
  };

  const handleClear = () => {
    setSelectedSegments([]);
    setError('');
  };

  const handleSubmitRoute = async () => {
    if (!game) {
      setError('Game data is not ready');
      return;
    }

    try {
      navigate('/execute', {
        state: { route: selectedSegments, gameId: game.gameId },
      });
    } catch (err) {
      setError('Error submitting route');
    }
  };

  if (!game) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-8">
          <h2>Route Planning</h2>
          <p className="text-muted">
            Plan your route from <strong>{game.startStation.name}</strong> to{' '}
            <strong>{game.destinationStation.name}</strong>
          </p>
        </div>
        <div className="col-4 text-end">
          <div
            className="fw-bold"
            style={{
              fontSize: '2rem',
              fontFamily: 'monospace',
              color: timeLeft <= 10 ? '#dc3545' : 'inherit',
            }}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-8">
          {network && <NetworkVisualization network={network} showSegments={false} />}
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
            <h5>Route Builder ({selectedSegments.length} segments)</h5>
            <p className="text-muted mb-3">Click segments to add them to your route:</p>

            <div className="list-group" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {allSegments.map((seg) => (
                <button
                  key={seg.id}
                  className={`list-group-item list-group-item-action text-start ${
                    selectedSegments.includes(seg.id) ? 'active' : ''
                  }`}
                  onClick={() => toggleSegment(seg.id)}
                  type="button"
                >
                  <small>
                    {seg.station_a_name} ↔ {seg.station_b_name}
                  </small>
                </button>
              ))}
            </div>

            <div className="mt-4 d-flex gap-2">
              <button
                className="btn btn-outline-secondary flex-grow-1"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                className="btn btn-primary flex-grow-1"
                onClick={handleSubmitRoute}
              >
                Submit Route
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
