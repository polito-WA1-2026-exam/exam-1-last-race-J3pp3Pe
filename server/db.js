import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'game.db');

let db;

export function connectDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else {
        console.log('Connected to database:', dbPath);
        resolve();
      }
    });
  });
}

export function promiseDb(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function promiseDbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('promiseDbGet called but db is undefined');
      reject(new Error('Database not connected'));
      return;
    }
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function promiseDbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

export function getDatabase() {
  return db;
}

export async function getUserByUsername(username) {
  return promiseDbGet('SELECT * FROM users WHERE username = ?', [username]);
}

export async function getUserById(id) {
  return promiseDbGet('SELECT id, username FROM users WHERE id = ?', [id]);
}

export async function getNetworkData() {
  const lines = await promiseDb('SELECT * FROM lines');
  const stations = await promiseDb('SELECT * FROM stations');
  const segments = await promiseDb(
    `SELECT s.id, s.station_a_id, s.station_b_id, s.line_id,
            sa.name as station_a_name, sb.name as station_b_name
     FROM segments s
     JOIN stations sa ON s.station_a_id = sa.id
     JOIN stations sb ON s.station_b_id = sb.id`
  );

  return { lines, stations, segments };
}

export async function getStationConnections(stationId) {
  return promiseDb(
    `SELECT DISTINCT s.id, s.name, seg.line_id, l.name as line_name
     FROM stations s
     JOIN segments seg ON (seg.station_a_id = ? AND seg.station_b_id = s.id) OR
                          (seg.station_b_id = ? AND seg.station_a_id = s.id)
     JOIN lines l ON seg.line_id = l.id
     WHERE s.id != ?`,
    [stationId, stationId, stationId]
  );
}

export async function getAllStations() {
  return promiseDb('SELECT * FROM stations');
}

export async function getSegmentById(id) {
  return promiseDbGet('SELECT * FROM segments WHERE id = ?', [id]);
}

export async function getSegmentByStations(stationAId, stationBId) {
  return promiseDbGet(
    'SELECT * FROM segments WHERE (station_a_id = ? AND station_b_id = ?) OR (station_a_id = ? AND station_b_id = ?)',
    [stationAId, stationBId, stationBId, stationAId]
  );
}

export async function getRandomEvent() {
  return promiseDbGet('SELECT * FROM events ORDER BY RANDOM() LIMIT 1');
}

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
