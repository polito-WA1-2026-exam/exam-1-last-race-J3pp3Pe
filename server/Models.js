// Game data models

export class User {
  constructor(id, username) {
    this.id = id;
    this.username = username;
  }
}

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

export class GameEvent {
  constructor(id, description, coin_effect) {
    this.id = id;
    this.description = description;
    this.coin_effect = coin_effect;
  }
}

export class Game {
  constructor(id, user_id, start_station_id, destination_station_id, submitted_route, is_valid, final_score, created_at) {
    this.id = id;
    this.user_id = user_id;
    this.start_station_id = start_station_id;
    this.destination_station_id = destination_station_id;
    this.submitted_route = submitted_route;
    this.is_valid = is_valid;
    this.final_score = final_score;
    this.created_at = created_at;
  }
}

export class GameExecutionEvent {
  constructor(segmentId, event, coinEffect, coinsAfter) {
    this.segmentId = segmentId;
    this.event = event;
    this.coinEffect = coinEffect;
    this.coinsAfter = coinsAfter;
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
