import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameContext from '../contexts/GameContext.jsx';
import NetworkVisualization from '../components/NetworkVisualization';

export default function SetupPage() {
  const { network, loadNetwork, loading, error } = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!network) {
      loadNetwork();
    }
  }, []);

  const handleStart = async () => {
    navigate('/plan');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
        <p>Loading network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading network: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <h2>Game Setup - Metro Network</h2>
          <p className="text-muted">
            Familiarize yourself with the metro network. Click "Start Game" when ready.
          </p>
        </div>
      </div>

      {network && <NetworkVisualization network={network} />}

      <div className="row mt-5">
        <div className="col-12 text-center">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
