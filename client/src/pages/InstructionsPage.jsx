import React from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../contexts/UserContext.jsx';

export default function InstructionsPage() {
  const { user } = useContext(UserContext);
  const backTarget = user ? '/setup' : '/';
  const backLabel = user ? 'Back to Setup' : 'Back to Login';

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
                a valid route through the underground network within a strict time limit. Navigate from
                a randomly assigned starting station to a destination, gaining or losing coins based on
                unexpected events along the way.
              </p>
            </div>

            <div className="mb-4">
              <h5>🎮 Game Phases</h5>
              <div className="ps-3">
                <p><strong>1. Setup</strong><br />
                Study the complete network map with all stations, lines, and connections. Take your time to memorize it!</p>

                <p><strong>2. Planning (90 seconds)</strong><br />
                The connecting lines disappear from the map! You must mentally reconstruct the network and build your route by selecting segments (station pairs) in sequence. If time runs out, your route is submitted exactly as it is.</p>

                <p><strong>3. Execution</strong><br />
                Your route is validated step by step. For each valid segment traveled, a random event occurs that affects your coin total (-4 to +4 coins). <em>Warning: If your submitted route is invalid or incomplete, this phase is skipped and you immediately lose all 20 coins!</em></p>

                <p><strong>4. Result</strong><br />
                Your final score corresponds to the coins remaining at the end of the journey. Negative scores are recorded as zero.</p>
              </div>
            </div>

            <div className="mb-4">
              <h5>⚙️ Rules for a Valid Route</h5>
              <ul>
                <li>Start with 20 coins per game.</li>
                <li>The route must start at the assigned start station and end at the assigned destination.</li>
                <li>Segments must be selected in a continuous sequence.</li>
                <li><strong>Line Changes:</strong> You can only switch from one line to another at designated interchange stations.</li>
                <li><strong>No Backtracking:</strong> You may visit the same station more than once, but you can NEVER travel the same segment twice.</li>
              </ul>
            </div>

            <div className="mb-4">
              <h5>🏆 Rankings</h5>
              <p>Only registered users can play the game. You can play as many times as you want, and your absolute best score will be displayed on the global general ranking page!</p>
            </div>
            <div className="text-center mt-5">
              <Link to={backTarget} className="btn btn-primary btn-lg">
                {backLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}