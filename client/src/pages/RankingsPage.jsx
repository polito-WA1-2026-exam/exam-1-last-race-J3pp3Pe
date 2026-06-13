import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameContext from '../contexts/GameContext.jsx';

export default function RankingsPage() {
  const { rankings, fetchRankings, loading, error } = useContext(GameContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div>
      <div className="row mb-4">
        <div className="col-12">
          <h2>🏆 Leaderboard</h2>
          <p className="text-muted">Top players ranked by best score</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          Error loading rankings: {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p>Loading rankings...</p>
        </div>
      ) : rankings && rankings.length > 0 ? (
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Rank</th>
                      <th scope="col">Player</th>
                      <th scope="col">Best Score</th>
                      <th scope="col">Games Played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((entry) => (
                      <tr key={entry.id}>
                        <td className="fw-bold">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '#'}
                          {entry.rank}
                        </td>
                        <td>{entry.username}</td>
                        <td className="fw-bold text-warning" style={{ fontFamily: 'monospace' }}>
                          {entry.best_score || 0}
                        </td>
                        <td className="text-muted">{entry.game_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No rankings yet. Play a game to get on the leaderboard!</p>
        </div>
      )}

      <div className="text-center mt-5">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/setup')}
        >
          🎮 Play Game
        </button>
      </div>
    </div>
  );
}
