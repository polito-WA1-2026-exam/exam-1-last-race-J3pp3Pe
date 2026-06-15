// Data Access Object - all database operations
import { promiseDb, promiseDbGet, promiseDbRun, getNetworkData } from './db.js';

// User operations
export async function getUserByUsername(username) {
  return promiseDbGet('SELECT * FROM users WHERE username = ?', [username]);
}

export async function getUserById(id) {
  return promiseDbGet('SELECT id, username, password_hash FROM users WHERE id = ?', [id]);
}

// Network operations
export async function getNetwork() {
  return getNetworkData();
}

export async function getAllStations() {
  return promiseDb('SELECT * FROM stations');
}

// Game operations
export async function createGame(userId, startStationId, destinationStationId) {
  const result = await promiseDbRun(
    'INSERT INTO games (user_id, start_station_id, destination_station_id) VALUES (?, ?, ?)',
    [userId, startStationId, destinationStationId]
  );

  return result.lastID;
}

export async function getGameById(gameId) {
  return promiseDbGet('SELECT * FROM games WHERE id = ?', [gameId]);
}

export async function updateGameResult(gameId, route, isValid, finalScore) {
  await promiseDbRun(
    'UPDATE games SET submitted_route = ?, is_valid = ?, final_score = ? WHERE id = ?',
    [JSON.stringify(route), isValid ? 1 : 0, finalScore, gameId]
  );
}

export async function saveGameSegment(
  gameId,
  segmentSequence,
  segmentId,
  eventId,
  coinsBefore,
  coinsAfter
) {
  await promiseDbRun(
    'INSERT INTO game_segments (game_id, segment_sequence, segment_id, event_id, coins_before, coins_after) VALUES (?, ?, ?, ?, ?, ?)',
    [gameId, segmentSequence, segmentId, eventId, coinsBefore, coinsAfter]
  );
}

// Segment operations
export async function getSegmentById(id) {
  return promiseDbGet('SELECT * FROM segments WHERE id = ?', [id]);
}

export async function getAllSegments() {
  return promiseDb('SELECT * FROM segments');
}

// Event operations
export async function getRandomEvent() {
  return promiseDbGet('SELECT * FROM events ORDER BY RANDOM() LIMIT 1');
}

// Rankings operations
export async function getUserRankings() {
  return promiseDb(`
    SELECT
      ROW_NUMBER() OVER (ORDER BY MAX(g.final_score) DESC) as rank,
      u.id,
      u.username,
      MAX(g.final_score) as best_score,
      COUNT(g.id) as game_count
     FROM users u
     LEFT JOIN games g ON u.id = g.user_id AND g.is_valid = 1
     GROUP BY u.id
     ORDER BY best_score DESC, game_count DESC
  `);
}

// Utility for getting adjacent stations (for pathfinding)
export async function getAdjacentStations(stationId) {
  return promiseDb(
    `SELECT DISTINCT CASE
      WHEN station_a_id = ? THEN station_b_id
      ELSE station_a_id
    END as next_station
    FROM segments
    WHERE station_a_id = ? OR station_b_id = ?`,
    [stationId, stationId, stationId]
  );
}

export async function getSegmentConnections(stationId) {
  return promiseDb(
    `SELECT DISTINCT seg.line_id FROM segments seg
     WHERE seg.station_a_id = ? OR seg.station_b_id = ?`,
    [stationId, stationId]
  );
}
