import * as dao from '../dao.js';

export async function validateRoute(
  startStationId,
  destinationStationId,
  segmentIds,
  gameId = null
) {
  if (!segmentIds || segmentIds.length === 0) {
    return { valid: false, reason: 'Route is empty' };
  }

  // Get all segments to check IDs
  const segments = await dao.getAllSegments();

  const allSegments = new Map();
  segments.forEach((seg) => {
    allSegments.set(seg.id, seg);
  });

  // Check all segment IDs exist
  for (const segId of segmentIds) {
    if (!allSegments.has(segId)) {
      return { valid: false, reason: `Invalid segment ID: ${segId}` };
    }
  }

  // Check no duplicate segments
  const uniqueSegments = new Set(segmentIds);
  if (uniqueSegments.size !== segmentIds.length) {
    return { valid: false, reason: 'Cannot use same segment twice' };
  }

  // Reconstruct route from segments
  const segmentObjects = segmentIds.map((id) => allSegments.get(id));
  const routeStations = buildRouteStations(segmentObjects);

  if (!routeStations) {
    return { valid: false, reason: 'Segments do not form a continuous route' };
  }

  // Check start and end stations
  const firstStation = routeStations[0];
  const lastStation = routeStations[routeStations.length - 1];

  if (firstStation !== startStationId || lastStation !== destinationStationId) {
    return {
      valid: false,
      reason: `Route must start at station ${startStationId} and end at station ${destinationStationId}`,
    };
  }

  // Check line changes only at interchange stations
  const lineChangeValid = await checkLineChangesValid(segmentObjects, routeStations);
  if (!lineChangeValid) {
    return {
      valid: false,
      reason: 'Can only change lines at interchange stations',
    };
  }

  return { valid: true, reason: 'Route is valid', stations: routeStations };
}

function buildRouteStations(segments) {
  if (segments.length === 0) return null;

  const stations = [segments[0].station_a_id];
  let currentStation = segments[0].station_b_id;
  stations.push(currentStation);

  const usedSegments = new Set([0]);

  for (let i = 1; i < segments.length; i++) {
    let found = false;

    for (let j = 0; j < segments.length; j++) {
      if (usedSegments.has(j)) continue;

      const seg = segments[j];
      if (seg.station_a_id === currentStation) {
        stations.push(seg.station_b_id);
        currentStation = seg.station_b_id;
        usedSegments.add(j);
        found = true;
        break;
      } else if (seg.station_b_id === currentStation) {
        stations.push(seg.station_a_id);
        currentStation = seg.station_a_id;
        usedSegments.add(j);
        found = true;
        break;
      }
    }

    if (!found) {
      return null;
    }
  }

  return stations;
}

async function checkLineChangesValid(segments, routeStations) {
  const lineSequence = segments.map((seg) => seg.line_id);

  for (let i = 1; i < lineSequence.length; i++) {
    if (lineSequence[i] !== lineSequence[i - 1]) {
      const stationId = routeStations[i];
      const linesAtStation = await dao.getSegmentConnections(stationId);

      const lineIds = new Set(linesAtStation.map((l) => l.line_id));

      if (
        !lineIds.has(lineSequence[i - 1]) ||
        !lineIds.has(lineSequence[i])
      ) {
        return false;
      }
    }
  }

  return true;
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

export async function isReachable(startStationId, destinationStationId) {
  return (await calculateMinDistance(startStationId, destinationStationId)) >= 0;
}
