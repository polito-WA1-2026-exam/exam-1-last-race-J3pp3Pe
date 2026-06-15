import bcryptjs from 'bcryptjs';

import { getDatabase, initDatabase } from './db.js';

function promiseDbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

function promiseDbGet(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function seedDatabase() {
  const db = getDatabase();

  const hash1 = bcryptjs.hashSync('password1', 10);
  const hash2 = bcryptjs.hashSync('password2', 10);
  const hash3 = bcryptjs.hashSync('password3', 10);

  await promiseDbRun(db, 'INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    'alice',
    hash1,
  ]);
  await promiseDbRun(db, 'INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    'bob',
    hash2,
  ]);
  await promiseDbRun(db, 'INSERT INTO users (username, password_hash) VALUES (?, ?)', [
    'charlie',
    hash3,
  ]);

  const lines = [
    { name: 'Red Line', color: '#E60000' },
    { name: 'Green Line', color: '#00AA44' },
    { name: 'Blue Line', color: '#0066CC' },
    { name: 'Yellow Line', color: '#FFCC00' },
    { name: 'Purple Line', color: '#9933CC' },
  ];

  const lineIds = {};
  for (const line of lines) {
    const result = await promiseDbRun(db, 'INSERT INTO lines (name, color) VALUES (?, ?)', [
      line.name,
      line.color,
    ]);
    lineIds[line.name] = result.lastID;
  }

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
    const result = await promiseDbRun(db, 'INSERT INTO stations (name, x, y) VALUES (?, ?, ?)', [
      station.name,
      station.x,
      station.y,
    ]);
    stationIds[station.name] = result.lastID;
  }

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
    'Purple Line': ['Hjalmar Brantingsplatsen', 'Valand', 'Chalmers', 'Vasa Viktoria'],
  };

  for (const [lineName, stationNames] of Object.entries(lineConnections)) {
    const lineId = lineIds[lineName];

    for (let i = 0; i < stationNames.length; i++) {
      const stationName = stationNames[i];
      const stationId = stationIds[stationName];
      await promiseDbRun(
        db,
        'INSERT INTO line_stations (line_id, station_id, order_pos) VALUES (?, ?, ?)',
        [lineId, stationId, i]
      );
    }

    for (let i = 0; i < stationNames.length - 1; i++) {
      const stationAId = stationIds[stationNames[i]];
      const stationBId = stationIds[stationNames[i + 1]];

      await promiseDbRun(
        db,
        'INSERT INTO segments (station_a_id, station_b_id, line_id) VALUES (?, ?, ?)',
        [stationAId, stationBId, lineId]
      );

      await promiseDbRun(
        db,
        'INSERT INTO segments (station_a_id, station_b_id, line_id) VALUES (?, ?, ?)',
        [stationBId, stationAId, lineId]
      );
    }
  }

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
    await promiseDbRun(db, 'INSERT INTO events (description, coin_effect) VALUES (?, ?)', [
      event.description,
      event.coin_effect,
    ]);
  }

  const alice = await promiseDbGet(db, 'SELECT id FROM users WHERE username = ?', ['alice']);
  const bob = await promiseDbGet(db, 'SELECT id FROM users WHERE username = ?', ['bob']);

  await promiseDbRun(
    db,
    'INSERT INTO games (user_id, start_station_id, destination_station_id, is_valid, final_score) VALUES (?, ?, ?, ?, ?)',
    [alice.id, stationIds['Centralen'], stationIds['Scaniabadet'], 1, 18]
  );

  await promiseDbRun(
    db,
    'INSERT INTO games (user_id, start_station_id, destination_station_id, is_valid, final_score) VALUES (?, ?, ?, ?, ?)',
    [bob.id, stationIds['Korsvägen'], stationIds['Valand'], 1, 22]
  );

  await promiseDbRun(
    db,
    'INSERT INTO games (user_id, start_station_id, destination_station_id, is_valid, final_score) VALUES (?, ?, ?, ?, ?)',
    [bob.id, stationIds['Marklandsgatan'], stationIds['Chalmers'], 1, 25]
  );

  console.log('Database seeded');
}

async function main() {
  try {
    await initDatabase();
    await seedDatabase();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  }
}

main();