import bcryptjs from 'bcryptjs';
import { connectDatabase, promiseDbRun } from './db.js';

async function initDatabase() {
  console.log('Skapar databasstruktur och tabeller...');
  
  const tables = ['games', 'segments', 'events', 'stations', 'lines', 'users'];
  for (const table of tables) {
    await promiseDbRun(`DROP TABLE IF EXISTS ${table}`);
  }

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT
    )
  `);

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      x INTEGER,
      y INTEGER
    )
  `);

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_a_id INTEGER NOT NULL,
      station_b_id INTEGER NOT NULL,
      line_id INTEGER NOT NULL,
      FOREIGN KEY (station_a_id) REFERENCES stations(id) ON DELETE CASCADE,
      FOREIGN KEY (station_b_id) REFERENCES stations(id) ON DELETE CASCADE,
      FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
      UNIQUE(station_a_id, station_b_id, line_id)
    )
  `);

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      coin_effect INTEGER NOT NULL CHECK(coin_effect >= -4 AND coin_effect <= 4)
    )
  `);

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      start_station_id INTEGER NOT NULL,
      destination_station_id INTEGER NOT NULL,
      submitted_route TEXT,
      is_valid INTEGER DEFAULT 0,
      final_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (start_station_id) REFERENCES stations(id),
      FOREIGN KEY (destination_station_id) REFERENCES stations(id)
    )
  `);

  await promiseDbRun('CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id)');
  await promiseDbRun('CREATE INDEX IF NOT EXISTS idx_segments_stations ON segments(station_a_id, station_b_id)');
}

async function seedData() {
  //users
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

//lines
const lines = [
    { name: '7', color: '#8B4513' },    // brown
    { name: '6', color: '#FFA500' },    // orange
    { name: '11', color: '#000000' },   // black
    { name: '12', color: '#40E0D0' }    // turquoise
  ];

  for (const line of lines) {
    await promiseDbRun('INSERT OR IGNORE INTO lines (name, color) VALUES (?, ?)', [line.name, line.color]);
  }

  const stations = [
    { name: 'Saltholmen', x: 10, y: 95 },
    { name: 'Frölunda Torg', x: 22, y: 95 },
    { name: 'Marklandsgatan', x: 22, y: 75 },
    { name: 'Järntorget', x: 22, y: 60 },
    { name: 'Lindholmen', x: 70, y: 10 },
    { name: 'Länsmansgården', x: 15, y: 5 },
    { name: 'Hjälmarbrantingsplatsen', x: 32, y: 40 },
    { name: 'Vasaplatsen', x: 46, y: 60 },
    { name: 'Chalmers', x: 34, y: 70 },
    { name: 'Korsvägen', x: 70, y: 60 },
    { name: 'Brunnsparken', x: 50, y: 48 },
    { name: 'Centralstationen', x: 70, y: 30 },
    { name: 'Mölndal', x: 70, y: 95 },
    { name: 'Kortedala', x: 95, y: 30 },
    { name: 'Bergsjön', x: 95, y: 15 },
    {name: 'Angered', x:50, y:10 }
  ];
  for (const station of stations) {
    await promiseDbRun('INSERT OR IGNORE INTO stations (name, x, y) VALUES (?, ?, ?)', [station.name, station.x, station.y]);
  }

  async function insertSegment(lineName, stationA, stationB) {
    await promiseDbRun(`
      INSERT OR IGNORE INTO segments (line_id, station_a_id, station_b_id)
      VALUES (
        (SELECT id FROM lines WHERE name = ?),
        (SELECT id FROM stations WHERE name = ?),
        (SELECT id FROM stations WHERE name = ?)
      )
    `, [lineName, stationA, stationB]);
  }

  // Line 7
  await insertSegment('7', 'Frölunda Torg', 'Marklandsgatan');
  await insertSegment('7', 'Marklandsgatan', 'Chalmers');
  await insertSegment('7', 'Chalmers', 'Vasaplatsen');
  await insertSegment('7', 'Vasaplatsen', 'Brunnsparken');
  await insertSegment('7', 'Brunnsparken', 'Angered');


  // Line 6
  await insertSegment('6', 'Länsmansgården', 'Hjälmarbrantingsplatsen');
  await insertSegment('6', 'Hjälmarbrantingsplatsen', 'Järntorget');
  await insertSegment('6', 'Järntorget', 'Chalmers');
  await insertSegment('6', 'Chalmers', 'Korsvägen');
  await insertSegment('6', 'Korsvägen', 'Kortedala');

  // Line 11
  await insertSegment('11', 'Saltholmen', 'Järntorget');
  await insertSegment('11', 'Järntorget', 'Brunnsparken');
  await insertSegment('11', 'Brunnsparken', 'Centralstationen');
  await insertSegment('11', 'Centralstationen', 'Bergsjön');

  // Line 12
  await insertSegment('12', 'Mölndal', 'Korsvägen');
  await insertSegment('12', 'Korsvägen', 'Centralstationen');
  await insertSegment('12', 'Centralstationen', 'Lindholmen');

  // Completed games
  await promiseDbRun(
    `INSERT INTO games (user_id, start_station_id, destination_station_id, submitted_route, is_valid, final_score)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [1, 1, 11, JSON.stringify([11, 12]), 1, 18]
  );
  await promiseDbRun(
    `INSERT INTO games (user_id, start_station_id, destination_station_id, submitted_route, is_valid, final_score)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [2, 6, 4, JSON.stringify([6, 7]), 1, 15]
  );
  await promiseDbRun(
    `INSERT INTO games (user_id, start_station_id, destination_station_id, submitted_route, is_valid, final_score)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [1, 13, 5, JSON.stringify([15, 16, 17]), 1, 24]
  );

  // Events
  const events = [
    { desc: 'Nobody pressed stop and the platform was empty, so you got to skip the station entirely!', effect: 4},
    { desc: 'Signal priority! You hit a green wave all the way.', effect: 3 },
    { desc: 'You cross paths with your favorite colleague at an intersection and exchange a friendly wave.', effect: 2 },
    { desc: 'A small child on the platform waves excitedly at you. You ding the bell back and smile!', effect: 1 },
    { desc: 'Calm driving. The sun is actually shining in Gothenburg today.', effect: 0 },
    { desc: 'The doors are jammed because travelers are crowding in.', effect: -1 },
    { desc: 'Gear error, you have to go out and re-lay the track manually with the skewer.', effect: -2 },
    { desc: 'A badly parked Volvo is blocking the tracks. You have to honk your bell and wait for the owner to move it.', effect: -3 },
    { desc: 'The tram derails and crashes into a pizzeria.', effect: -4 }
  ];
  for (const ev of events) {
    await promiseDbRun('INSERT OR IGNORE INTO events (description, coin_effect) VALUES (?, ?)', [ev.desc, ev.effect]);
  }
}

async function main() {
  try {
    await connectDatabase();
    await initDatabase();
    await seedData();
    
    console.log('✅ Databasen är initierad och seedad!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ett fel uppstod:', error);
    process.exit(1);
  }
}

main();