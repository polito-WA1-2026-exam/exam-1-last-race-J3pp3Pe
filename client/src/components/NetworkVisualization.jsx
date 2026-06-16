import React from 'react';

export default function NetworkVisualization({
  network,
  onSegmentClick,
  selectedSegments = [],
  showSegments = true,
}) {
  if (!network || !network.stations || !network.lines) {
    return <div className="text-center">No network data available</div>;
  }

  const stationMap = {};
  network.stations.forEach((s) => {
    stationMap[s.id] = s;
  });

  const lineMap = {};
  network.lines.forEach((l) => {
    lineMap[l.id] = l;
  });

  const width = 800;
  const height = 600;
  const padding = 60;

  const xs = network.stations.map((s) => s.x || 0);
  const ys = network.stations.map((s) => s.y || 0);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const scale = (value, min, range, size) => {
    return padding + ((value - min) / range) * (size - 2 * padding);
  };

  const getStationPosition = (station) => {
    return {
      x: scale(station.x, minX, rangeX, width),
      y: scale(station.y, minY, rangeY, height),
    };
  };

  // Group segments by line and render them when the full network should be shown.
  const segmentsByLine = {};
  if (showSegments) {
    network.segments.forEach((seg) => {
      if (!segmentsByLine[seg.line_id]) {
        segmentsByLine[seg.line_id] = [];
      }
      segmentsByLine[seg.line_id].push(seg);
    });
  }

  return (
    <div className="bg-white border rounded p-3 my-3 overflow-auto">
      <svg width={width} height={height} style={{ border: '1px solid #ddd', borderRadius: 6 }}>
        {/* Draw lines */}
        {showSegments &&
          Object.entries(segmentsByLine).map(([lineId, segments]) => {
            const line = lineMap[lineId];
            return (
              <g key={`line-${lineId}`}>
                {segments.map((seg) => {
                  const stationA = stationMap[seg.station_a_id];
                  const stationB = stationMap[seg.station_b_id];
                  if (!stationA || !stationB) return null;

                  const posA = getStationPosition(stationA);
                  const posB = getStationPosition(stationB);

                  return (
                    <line
                      key={`segment-${seg.id}`}
                      x1={posA.x}
                      y1={posA.y}
                      x2={posB.x}
                      y2={posB.y}
                      style={{ cursor: 'pointer' }}
                      strokeWidth="3"
                      fill="none"
                      stroke={line?.color || '#999'}
                      strokeOpacity="0.6"
                    />
                  );
                })}
              </g>
            );
          })}

        {/* Draw stations */}
        {network.stations.map((station) => {
          const pos = getStationPosition(station);
          return (
            <g key={`station-${station.id}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="8"
                fill="#667eea"
                stroke="#764ba2"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onClick={() => onSegmentClick && onSegmentClick(station.id)}
              />
              <text
                x={pos.x}
                y={pos.y + 20}
                textAnchor="middle"
                fill="#333"
                fontSize="11"
              >
                {station.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3">
        <small className="text-muted">
          {network.lines.length} lines • {network.stations.length} stations
          {showSegments ? ` • ${network.segments.length} segments` : ' • segments hidden'}
        </small>
      </div>
    </div>
  );
}
