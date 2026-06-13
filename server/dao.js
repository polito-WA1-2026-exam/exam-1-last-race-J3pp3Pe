// Data Access Object - all database operations
import { getDatabase } from './db.js';

// User operations
export async function getUserByUsername(username) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function getUserById(id) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Network operations
export async function getNetwork() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    const queries = {
      lines: new Promise((res, rej) => {
        db.all('SELECT * FROM lines', (err, rows) => {
          if (err) rej(err);
          else res(rows || []);
        });
      }),
      stations: new Promise((res, rej) => {
        db.all('SELECT * FROM stations', (err, rows) => {
          if (err) rej(err);
          else res(rows || []);
        });
      }),
      segments: new Promise((res, rej) => {
        db.all(
          `SELECT s.id, s.station_a_id, s.station_b_id, s.line_id,
                  sa.name as station_a_name, sb.name as station_b_name
           FROM segments s
           JOIN stations sa ON s.station_a_id = sa.id
           JOIN stations sb ON s.station_b_id = sb.id`,
          (err, rows) => {
            if (err) rej(err);
            else res(rows || []);
          }
        );
      }),
    };

    Promise.all([queries.lines, queries.stations, queries.segments])
      .then(([lines, stations, segments]) => {
        resolve({ lines, stations, segments });
      })
      .catch(reject);
  });
}

export async function getAllStations() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM stations', (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Game operations
export async function createGame(userId, startStationId, destinationStationId) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO games (user_id, start_station_id, destination_station_id) VALUES (?, ?, ?)',
      [userId, startStationId, destinationStationId],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

export async function getGameById(gameId) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM games WHERE id = ?', [gameId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function updateGameResult(gameId, route, isValid, finalScore) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE games SET submitted_route = ?, is_valid = ?, final_score = ? WHERE id = ?',
      [JSON.stringify(route), isValid ? 1 : 0, finalScore, gameId],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export async function saveGameSegment(
  gameId,
  segmentSequence,
  segmentId,
  eventId,
  coinsBefore,
  coinsAfter
) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO game_segments (game_id, segment_sequence, segment_id, event_id, coins_before, coins_after) VALUES (?, ?, ?, ?, ?, ?)',
      [gameId, segmentSequence, segmentId, eventId, coinsBefore, coinsAfter],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Segment operations
export async function getSegmentById(id) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM segments WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function getAllSegments() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM segments', (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Event operations
export async function getRandomEvent() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM events ORDER BY RANDOM() LIMIT 1', (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Rankings operations
export async function getUserRankings() {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY MAX(g.final_score) DESC) as rank,
        u.id,
        u.username,
        MAX(g.final_score) as best_score,
        COUNT(g.id) as game_count
       FROM users u
       LEFT JOIN games g ON u.id = g.user_id AND g.is_valid = 1
       GROUP BY u.id
       ORDER BY best_score DESC, game_count DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

// Utility for getting adjacent stations (for pathfinding)
export async function getAdjacentStations(stationId) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT CASE
        WHEN station_a_id = ? THEN station_b_id
        ELSE station_a_id
      END as next_station
      FROM segments
      WHERE station_a_id = ? OR station_b_id = ?`,
      [stationId, stationId, stationId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

export async function getSegmentConnections(stationId) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT seg.line_id FROM segments seg
       WHERE seg.station_a_id = ? OR seg.station_b_id = ?`,
      [stationId, stationId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}
