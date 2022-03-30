import { propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';

export function getOrbit(satrec, period, start, segments = 100) {
  const milliseconds = (period * 60000) / segments;

  const vertices = [];
  for (let i = 0; i <= segments; i++) {
    const date = new Date(start.getTime() + i * milliseconds);
    const satelliteLocation = getSatelliteLocation(satrec, date, start);
    if (!satelliteLocation) {
      continue;
    }
    vertices.push(satelliteLocation);
  }

  return vertices;
}

export function getSatelliteLocation(satrec, date, start) {
  const propagation = propagate(satrec, date);
  const position = propagation?.position;
  if (!position || Number.isNaN(position.x) || Number.isNaN(position.y) || Number.isNaN(position.z)) {
    return null;
  }
  if (!start) {
    start = date;
  }
  const gmst = gstime(start);
  const geographic = eciToGeodetic(position, gmst);
  const { longitude, latitude, height } = geographic;

  const x = radiansToDegrees(longitude);
  const y = radiansToDegrees(latitude);
  const z = height * 1000;
  return { x, y, z };
}
