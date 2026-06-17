import * as dao from '../dao.js';

export async function validateRoute(startStationId, destinationStationId, segmentIds) {
  if (!segmentIds || segmentIds.length === 0) {
    return { valid: false, reason: 'Route is empty' };
  }

  // 1. Kolla dubbletter direkt (krav: "must not involve any segment more than once")
  if (new Set(segmentIds).size !== segmentIds.length) {
    return { valid: false, reason: 'Cannot use same segment twice' };
  }

  // 2. Hämta alla segment och gör en Map (mycket kortare syntax)
  const segmentsDb = await dao.getAllSegments();
  const allSegments = new Map(segmentsDb.map(seg => [seg.id, seg]));

  // 3. Spåra rutten steg för steg från startstationen
  const routeStations = [startStationId];
  let currentStation = startStationId;

  for (const segId of segmentIds) {
    const seg = allSegments.get(segId);
    
    if (!seg) {
      return { valid: false, reason: `Invalid segment ID: ${segId}` };
    }

    //check direction
    if (seg.station_a_id === currentStation) {
      currentStation = seg.station_b_id;
    } else if (seg.station_b_id === currentStation) {
      currentStation = seg.station_a_id;
    } else {
      return { valid: false, reason: 'Segments do not form a continuous route' };
    }

    routeStations.push(currentStation);
  }

  // Check if the final station is the destination
  if (currentStation !== destinationStationId) {
    return { valid: false, reason: 'Route does not end at the assigned destination' };
  }

  return { valid: true, reason: 'Route is valid', stations: routeStations };
}

export async function calculateMinDistance(startStationId, destinationStationId) {
  const queue = [[startStationId, 0]];
  const visited = new Set([startStationId]);

  while (queue.length > 0) {
    const [currentStation, distance] = queue.shift();

    if (currentStation === destinationStationId) {
      return distance;
    }

    const adjacent = await dao.getAdjacentStations(currentStation);

    for (const row of adjacent) {
      if (!visited.has(row.next_station)) {
        visited.add(row.next_station);
        queue.push([row.next_station, distance + 1]);
      }
    }
  }

  return -1;
}
