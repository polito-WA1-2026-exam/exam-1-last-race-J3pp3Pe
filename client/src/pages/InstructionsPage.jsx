import React from 'react';
import { Link } from 'react-router-dom';

export default function InstructionsPage() {
  return (
    <div className="row justify-content-center mt-4">
      <div className="col-lg-8">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="card-title mb-4">How to Play Last Race</h2>

            <div className="mb-4">
              <h5>📖 Game Overview</h5>
              <p>
                Last Race is a single-player metro navigation game where you must plan and execute
                a valid route through the metro network within the given time limit. Navigate from
                a starting station to a destination station, gaining or losing coins based on
                random events along the way.
              </p>
            </div>

            <div className="mb-4">
              <h5>🎮 Game Phases</h5>
              <div className="ps-3">
                <p><strong>1. Setup</strong><br />
                View the complete metro network with all stations and line connections.</p>

                <p><strong>2. Planning (90 seconds)</strong><br />
                Quickly analyze the network and build your route by selecting segments (station pairs).
                You must start from the assigned start station and end at the destination.</p>

                <p><strong>3. Execution</strong><br />
                Your route is validated. For each segment traveled, a random event occurs that
                affects your coin total. Watch as you journey through the network!</p>

                <p><strong>4. Results</strong><br />
                Your final score is based on coins remaining (minimum 0, can go negative but displays as 0).</p>
              </div>
            </div>

            <div className="mb-4">
              <h5>⚙️ Rules</h5>
              <ul>
                <li>Start with 20 coins per game</li>
                <li>Route must start at assigned start station</li>
                <li>Route must end at assigned destination station</li>
                <li>Minimum distance: 3 segments between start and destination</li>
                <li>Each segment can only be used once</li>
                <li>Can only change metro lines at interchange stations</li>
                <li>Segments must form a continuous path (no gaps)</li>
              </ul>
            </div>

            <div className="mb-4">
              <h5>💰 Scoring</h5>
              <p>Your score = coins remaining at the end.</p>
              <p>Random events give or take coins (from -4 to +4 per segment).</p>
              <p>Final negative scores are displayed as 0.</p>
            </div>

            <div className="mb-4">
              <h5>🏆 Ranking</h5>
              <p>Your best score from all games is recorded on the leaderboard.</p>
              <p>Only valid, completed routes count towards rankings.</p>
            </div>

            <div className="mb-4">
              <h5>🚇 Metro Network</h5>
              <ul>
                <li><strong>5 Lines:</strong> Red, Green, Blue, Yellow, Purple</li>
                <li><strong>13 Stations:</strong> Named after Gothenburg metro stations</li>
                <li><strong>Interchange Stations:</strong> Centralen, Korsvägen, Hjalmar Brantingsplatsen</li>
              </ul>
            </div>

            <div className="text-center mt-5">
              <Link to="/" className="btn btn-primary btn-lg">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
