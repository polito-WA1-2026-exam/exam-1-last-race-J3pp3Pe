// Game data models

export class Station {
  constructor(id, name, x, y) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
  }
}

export class Line {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}

export class Segment {
  constructor(id, station_a_id, station_b_id, line_id, station_a_name, station_b_name) {
    this.id = id;
    this.station_a_id = station_a_id;
    this.station_b_id = station_b_id;
    this.line_id = line_id;
    this.station_a_name = station_a_name;
    this.station_b_name = station_b_name;
  }
}

export class Game {
  constructor(gameId, startStation, destinationStation, initialCoins, timeLimit) {
    this.gameId = gameId;
    this.startStation = startStation;
    this.destinationStation = destinationStation;
    this.initialCoins = initialCoins;
    this.timeLimit = timeLimit;
    this.coins = initialCoins;
  }
}

export class GameResult {
  constructor(gameId, isValid, finalScore, events, reason = null) {
    this.gameId = gameId;
    this.isValid = isValid;
    this.finalScore = finalScore;
    this.events = events;
    this.reason = reason;
  }
}

export class User {
  constructor(id, username) {
    this.id = id;
    this.username = username;
  }
}

export class Ranking {
  constructor(rank, id, username, best_score, game_count) {
    this.rank = rank;
    this.id = id;
    this.username = username;
    this.best_score = best_score;
    this.game_count = game_count;
  }
}
