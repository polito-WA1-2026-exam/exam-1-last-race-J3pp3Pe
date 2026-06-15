import bcryptjs from 'bcryptjs';
import { connectDatabase, promiseDbRun } from './db.js';

// 1. Funktion för att skapa tabellstrukturen
async function initDatabase() {
  console.log('Skapar databasstruktur och tabeller...');
  
  // Rensa existerande tabeller för en ren omstart
  const tables = ['game_segments', 'games', 'segments', 'events', 'stations', 'lines', 'users'];
  for (const table of tables) {
    await promiseDbRun(`DROP TABLE IF EXISTS ${table}`);
  }

  // Skapa tabeller
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
      is_valid INTEGER DEFAULT 0,
      final_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (start_station_id) REFERENCES stations(id),
      FOREIGN KEY (destination_station_id) REFERENCES stations(id)
    )
  `);

  await promiseDbRun(`
    CREATE TABLE IF NOT EXISTS game_segments (
      game_id INTEGER NOT NULL,
      segment_sequence INTEGER NOT NULL,
      segment_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      coins_before INTEGER NOT NULL,
      coins_after INTEGER NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      FOREIGN KEY (segment_id) REFERENCES segments(id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      PRIMARY KEY (game_id, segment_sequence)
    )
  `);

  // Skapa index
  await promiseDbRun('CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id)');
  await promiseDbRun('CREATE INDEX IF NOT EXISTS idx_segments_stations ON segments(station_a_id, station_b_id)');
}

// 2. Funktion för att fylla på data
async function seedData() {
  console.log('Påbörjar seeding av Göteborgs spårvagnsnät...');

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

  // Linje 7
  await insertSegment('7', 'Frölunda Torg', 'Marklandsgatan');
  await insertSegment('7', 'Marklandsgatan', 'Chalmers');
  await insertSegment('7', 'Chalmers', 'Vasaplatsen');
  await insertSegment('7', 'Vasaplatsen', 'Brunnsparken');
  await insertSegment('7', 'Brunnsparken', 'Angered');


  // Linje 6
  await insertSegment('6', 'Länsmansgården', 'Hjälmarbrantingsplatsen');
  await insertSegment('6', 'Hjälmarbrantingsplatsen', 'Järntorget');
  await insertSegment('6', 'Järntorget', 'Chalmers');
  await insertSegment('6', 'Chalmers', 'Korsvägen');
  await insertSegment('6', 'Korsvägen', 'Kortedala');

  // Linje 11
  await insertSegment('11', 'Saltholmen', 'Järntorget');
  await insertSegment('11', 'Järntorget', 'Brunnsparken');
  await insertSegment('11', 'Brunnsparken', 'Centralstationen');
  await insertSegment('11', 'Centralstationen', 'Bergsjön');

  // Linje 12
  await insertSegment('12', 'Mölndal', 'Korsvägen');
  await insertSegment('12', 'Korsvägen', 'Centralstationen');
  await insertSegment('12', 'Centralstationen', 'Lindholmen');

  // Events
  const events = [
    { desc: 'Hittade en pantburk på sätet', effect: 1 },
    { desc: 'Västtrafik biljettkontroll! Du fick böter', effect: -4 },
    { desc: 'Lugn resa', effect: 0 },
    { desc: 'Spårvagnen var försenad, du köpte kaffe', effect: -1 }
  ];
  for (const ev of events) {
    await promiseDbRun('INSERT OR IGNORE INTO events (description, coin_effect) VALUES (?, ?)', [ev.desc, ev.effect]);
  }
}

// 3. Starta processen
async function main() {
  try {
    await connectDatabase(); // Koppla upp mot game.db
    await initDatabase();    // Skapa tabeller
    await seedData();        // Fyll med data
    
    console.log('✅ Databasen är initierad och seedad!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ett fel uppstod:', error);
    process.exit(1);
  }
}

main();