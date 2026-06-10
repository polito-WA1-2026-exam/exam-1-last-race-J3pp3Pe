import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'game.db');

let db;

function promiseDb(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function promiseDbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function promiseDbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Enable foreign keys
        await promiseDbRun('PRAGMA foreign_keys = ON');

        // Drop existing tables for fresh start (dev only)
        const tables = [
          'game_segments',
          'games',
          'line_stations',
          'segments',
          'events',
          'stations',
          'lines',
          'users',
        ];

        for (const table of tables) {
          await promiseDbRun(`DROP TABLE IF EXISTS ${table}`);
        }

        // Create tables
        await promiseDbRun(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await promiseDbRun(`
          CREATE TABLE lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            color TEXT
          )
        `);

        await promiseDbRun(`
          CREATE TABLE stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            x INTEGER,
            y INTEGER
          )
        `);

        await promiseDbRun(`
          CREATE TABLE line_stations (
            line_id INTEGER NOT NULL,
            station_id INTEGER NOT NULL,
            order_pos INTEGER NOT NULL,
            FOREIGN KEY (line_id) REFERENCES lines(id),
            FOREIGN KEY (station_id) REFERENCES stations(id),
            PRIMARY KEY (line_id, station_id)
          )
        `);

        await promiseDbRun(`
          CREATE TABLE segments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_a_id INTEGER NOT NULL,
            station_b_id INTEGER NOT NULL,
            line_id INTEGER NOT NULL,
            FOREIGN KEY (station_a_id) REFERENCES stations(id),
            FOREIGN KEY (station_b_id) REFERENCES stations(id),
            FOREIGN KEY (line_id) REFERENCES lines(id),
            UNIQUE(station_a_id, station_b_id, line_id)
          )
        `);

        await promiseDbRun(`
          CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            coin_effect INTEGER NOT NULL CHECK(coin_effect >= -4 AND coin_effect <= 4)
          )
        `);

        await promiseDbRun(`
          CREATE TABLE games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            start_station_id INTEGER NOT NULL,
            destination_station_id INTEGER NOT NULL,
            submitted_route TEXT,
            is_valid INTEGER DEFAULT 0,
            final_score INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (start_station_id) REFERENCES stations(id),
            FOREIGN KEY (destination_station_id) REFERENCES stations(id)
          )
        `);

        await promiseDbRun(`
          CREATE TABLE game_segments (
            game_id INTEGER NOT NULL,
            segment_sequence INTEGER NOT NULL,
            segment_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            coins_before INTEGER NOT NULL,
            coins_after INTEGER NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games(id),
            FOREIGN KEY (segment_id) REFERENCES segments(id),
            FOREIGN KEY (event_id) REFERENCES events(id),
            PRIMARY KEY (game_id, segment_sequence)
          )
        `);

        // Create indexes
        await promiseDbRun('CREATE INDEX idx_games_user_id ON games(user_id)');
        await promiseDbRun(
          'CREATE INDEX idx_segments_stations ON segments(station_a_id, station_b_id)'
        );
        await promiseDbRun('CREATE INDEX idx_line_stations_line ON line_stations(line_id)');

        await seedDatabase();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function seedDatabase() {
  // Seed users (3 users, 2 with game history)
  const hash1 = bcryptjs.hashSync('password1', 10);
  const hash2 = bcryptjs.hashSync('password2', 10);
  const hash3 = bcryptjs.hashSync('password3', 10);

  await promiseDbRun('INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    'alice',
    hash1,
  ]);
  await promiseDbRun('INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    'bob',
    hash2,
  ]);
  await promiseDbRun('INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    'charlie',
    hash3,
  ]);

  // Seed metro lines
  const lines = [
    { name: 'Red Line', color: '#E60000' },
    { name: 'Green Line', color: '#00AA44' },
    { name: 'Blue Line', color: '#0066CC' },
    { name: 'Yellow Line', color: '#FFCC00' },
    { name: 'Purple Line', color: '#9933CC' },
  ];

  const lineIds = {};
  for (const line of lines) {
    const result = await promiseDbRun('INSERT INTO lines (name, color) VALUES (?, ?)', [
      line.name,
      line.color,
    ]);
    lineIds[line.name] = result.lastID;
  }

  // Seed stations (Gothenburg stations)
  const stations = [
    { name: 'Centralen', x: 300, y: 250 },
    { name: 'Korsvägen', x: 200, y: 150 },
    { name: 'Hjalmar Brantingsplatsen', x: 400, y: 350 },
    { name: 'Scaniabadet', x: 100, y: 100 },
    { name: 'Ekmanska', x: 150, y: 200 },
    { name: 'Seminariegatan', x: 250, y: 50 },
    { name: 'Grönsakstorget', x: 400, y: 100 },
    { name: 'Marklandsgatan', x: 350, y: 400 },
    { name: 'Vasa Viktoria', x: 50, y: 300 },
    { name: 'Kapellplatsen', x: 500, y: 200 },
    { name: 'Järntorget', x: 200, y: 450 },
    { name: 'Chalmers', x: 450, y: 500 },
    { name: 'Valand', x: 300, y: 550 },
  ];

  const stationIds = {};
  for (const station of stations) {
    const result = await promiseDbRun('INSERT INTO stations (name, x, y) VALUES (?, ?, ?)', [
      station.name,
      station.x,
      station.y,
    ]);
    stationIds[station.name] = result.lastID;
  }

  // Define metro connections per line
  const lineConnections = {
    'Red Line': [
      'Marklandsgatan',
      'Hjalmar Brantingsplatsen',
      'Centralen',
      'Korsvägen',
      'Scaniabadet',
    ],
    'Green Line': ['Scaniabadet', 'Ekmanska', 'Centralen', 'Vasa Viktoria'],
    'Blue Line': [
      'Seminariegatan',
      'Grönsakstorget',
      'Hjalmar Brantingsplatsen',
      'Kapellplatsen',
    ],
    'Yellow Line': ['Korsvägen', 'Grönsakstorget', 'Järntorget', 'Valand'],
    'Purple Line': [
      'Hjalmar Brantingsplatsen',
      'Valand',
      'Chalmers',
      'Vasa Viktoria',
    ],
  };

  // Create segments for each line
  for (const [lineName, stationNames] of Object.entries(lineConnections)) {
    const lineId = lineIds[lineName];

    // Add line_stations associations
    for (let i = 0; i < stationNames.length; i++) {
      const stationName = stationNames[i];
      const stationId = stationIds[stationName];
      await promiseDbRun(
        'INSERT INTO line_stations (line_id, station_id, order_pos) VALUES (?, ?, ?)',
        [lineId, stationId, i]
      );
    }

    // Create segments between consecutive stations
    for (let i = 0; i < stationNames.length - 1; i++) {
      const stationAId = stationIds[stationNames[i]];
      const stationBId = stationIds[stationNames[i + 1]];

      // Insert bidirectional segments
      await promiseDbRun(
        'INSERT INTO segments (station_a_id, station_b_id, line_id) VALUES (?, ?, ?)',
        [stationAId, stationBId, lineId]
      );

      await promiseDbRun(
        'INSERT INTO segments (station_a_id, station_b_id, line_id) VALUES (?, ?, ?)',
        [stationBId, stationAId, lineId]
      );
    }
  }

  // Seed events (at least 8)
  const events = [
    { description: 'Quiet journey', coin_effect: 0 },
    { description: 'Wrong platform', coin_effect: -2 },
    { description: 'Kind passenger offers help', coin_effect: 1 },
    { description: 'Found dropped coins', coin_effect: 2 },
    { description: 'Door malfunction delay', coin_effect: -1 },
    { description: 'Tourist asks for directions', coin_effect: 0 },
    { description: 'Unexpected service interruption', coin_effect: -3 },
    { description: 'Lucky draw winners announcement', coin_effect: 3 },
    { description: 'Station maintenance noise', coin_effect: -1 },
  ];

  for (const event of events) {
    await promiseDbRun(
      'INSERT INTO events (description, coin_effect) VALUES (?, ?)',
      [event.description, event.coin_effect]
    );
  }

  // Seed games for users alice and bob
  const alice = await promiseDbGet('SELECT id FROM users WHERE username = ?', ['alice']);
  const bob = await promiseDbGet('SELECT id FROM users WHERE username = ?', ['bob']);

  const aliceId = alice.id;
  const bobId = bob.id;

  // Sample game for alice
  await promiseDbRun(
    'INSERT INTO games (user_id, start_station_id, destination_station_id, is_valid, final_score) VALUES (?, ?, ?, ?, ?)',
    [aliceId, stationIds['Centralen'], stationIds['Scaniabadet'], 1, 18]
  );

  // Sample game for bob
  await promiseDbRun(
    'INSERT INTO games (user_id, start_station_id, destination_station_id, is_valid, final_score) VALUES (?, ?, ?, ?, ?)',
    [bobId, stationIds['Korsvägen'], stationIds['Valand'], 1, 22]
  );

  // Add another game for bob (higher score)
  await promiseDbRun(
    'INSERT INTO games (user_id, start_station_id, destination_station_id, is_valid, final_score) VALUES (?, ?, ?, ?, ?)',
    [bobId, stationIds['Marklandsgatan'], stationIds['Chalmers'], 1, 25]
  );

  console.log('Database initialized and seeded');
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

export async function getLineStations(lineId) {
  return promiseDb(
    `SELECT s.id, s.name, ls.order_pos
     FROM line_stations ls
     JOIN stations s ON ls.station_id = s.id
     WHERE ls.line_id = ?
     ORDER BY ls.order_pos`,
    [lineId]
  );
}
