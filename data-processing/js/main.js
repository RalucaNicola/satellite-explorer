import { twoline2satrec, propagate, gstime, eciToGeodetic, radiansToDegrees } from './satellite.es.js';
import Polyline from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polyline.js';
import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js';
import FeatureLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/FeatureLayer.js';
(async function () {
  const metadataResponse = await fetch('../public/data/sat_metadata_012022.csv');
  const metadata = await metadataResponse.text();
  const mu = 398600.5;
  const infoCollection = {};
  const result = Papa.parse(metadata, { delimiter: ',' });
  for (let i = 1; i < result.data.length; i++) {
    const items = result.data[i];
    const norad = Number(items[27]);
    infoCollection[norad] = {
      name: items[1],
      official_name: items[2],
      country_UN_registry: items[3],
      country_operator: items[4],
      operator: items[5],
      users: items[6],
      purpose: items[7],
      detailed_purpose: items[8],
      orbit_class: items[9],
      orbit_type: items[10],
      perigee: items[12],
      apogee: items[13],
      //eccentricity: items[14],
      //inclination: items[15],
      //period: items[16],
      launch_mass: items[17],
      dry_mass: items[18],
      power: items[19],
      launch_date: items[20],
      expected_lifetime: items[21],
      contractor: items[22],
      launch_site: items[24],
      launch_vehicle: items[25],
      cospar: items[26],
      norad: items[27]
    };
  }
  const tleResponse = await fetch('../public/data/norad-tle.txt');
  const tleData = await tleResponse.text();

  const lines = tleData.split('\n');
  const count = (lines.length - (lines.length % 3)) / 3;
  const satellites = [];
  const uniqueSatelliteIDs = [];
  for (let i = 0; i < count; i++) {
    const line1 = lines[i * 3 + 0];
    const line2 = lines[i * 3 + 1];
    const line3 = lines[i * 3 + 2];
    if (!line1 || !line2 || !line3) {
      continue;
    }

    const satrec = twoline2satrec(line2, line3);
    if (!satrec) {
      continue;
    }
    const norad = Number.parseInt(satrec.satnum, 10);
    if (uniqueSatelliteIDs.indexOf(norad) === -1) {
      uniqueSatelliteIDs.push(norad);
      if (infoCollection.hasOwnProperty(norad)) {
        const sat = {
          norad,
          satrec,
          metadata: {
            inclination: (satrec.inclo * 180) / Math.PI,
            period: (2 * Math.PI) / satrec.no,
            eccentricity: (satrec.ecco * 180) / Math.PI,
            perigee_argument: (satrec.argpo * 180) / Math.PI,
            node: (satrec.nodeo * 180) / Math.PI,
            ...infoCollection[norad]
          }
        };
        satellites.push(sat);
      }
    }
  }

  const NOW = new Date();
  function getSatelliteLocation(satrec, date) {
    const propagation = propagate(satrec, date);
    const position = propagation?.position;
    if (!position || Number.isNaN(position.x) || Number.isNaN(position.y) || Number.isNaN(position.z)) {
      return null;
    }

    const gmst = gstime(NOW);
    const geographic = eciToGeodetic(position, gmst);
    const { longitude, latitude, height } = geographic;

    const x = radiansToDegrees(longitude);
    const y = radiansToDegrees(latitude);
    const z = height * 1000;
    return { x, y, z };
  }

  const satelliteLayer = new FeatureLayer({
    url: 'https://services9.arcgis.com/FF3qnCUixr5w9JQi/arcgis/rest/services/satellite_orbits/FeatureServer'
  });

  satelliteLayer
    .queryObjectIds()
    .then((results) => {
      const deleteFeatures = results.map((id) => {
        return {
          objectId: id
        };
      });
      satelliteLayer
        .applyEdits({ deleteFeatures })
        .then((result) => {
          console.log('Deleted features: ', result);
          console.log('Adding new features...');
          addSatellites(0);
        })
        .catch(console.error);
    })
    .catch(console.error);
  let unique = 0;

  function areSimilar(value1, value2) {
    if (Math.abs(value1 - value2) > 5) {
      return false;
    }
    return true;
  }
  function addSatellites(start) {
    const orbitGraphics = [];
    const uniqueOrbits = [];
    for (let index = start; index < start + 1000; index++) {
      if (index >= satellites.length) {
        break;
      }
      const sat = satellites[index];
      const { satrec, metadata } = sat;
      const { period, inclination, perigee_argument, node } = metadata;

      let display = 1;

      for (let i = 0; i < uniqueOrbits.length; i++) {
        const params = uniqueOrbits[i];
        if (
          areSimilar(params.inclination, inclination) &&
          areSimilar(params.perigee_argument, perigee_argument) &&
          areSimilar(params.node, node)
        ) {
          display = 0;
          break;
        }
      }
      if (display === 1) {
        unique++;
        uniqueOrbits.push({
          period,
          inclination,
          perigee_argument,
          node
        });
      }

      const coordinates = getOrbit(satrec, period, NOW);

      const attributes = {
        index,
        display,
        ...metadata
      };
      const orbit = new Graphic({
        attributes,
        geometry: new Polyline({
          paths: [coordinates.map((coordinate) => [coordinate.x, coordinate.y, coordinate.z])]
        })
      });
      orbitGraphics.push(orbit);
    }

    // start = start + 1000;
    // console.log('Added features: ', orbitGraphics, unique);
    // if (satellites.length - start > 0) {
    //   addSatellites(start);
    // }
    satelliteLayer
      .applyEdits({
        addFeatures: orbitGraphics
      })
      .then((result) => {
        start = start + 1000;
        console.log('Added features: ', result, unique);
        if (satellites.length - start > 0) {
          addSatellites(start);
        }
      })
      .catch(console.error);
  }
  // addSatellites(0);
  function getOrbit(satrec, period, start) {
    const SEGMENTS = period > 1000 ? 200 : period > 400 ? 100 : 50;
    const milliseconds = (period * 60000) / SEGMENTS;

    const vertices = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const date = new Date(start.getTime() + i * milliseconds);
      const satelliteLocation = getSatelliteLocation(satrec, date);
      if (!satelliteLocation) {
        continue;
      }
      vertices.push(satelliteLocation);
    }

    return vertices;
  }
})();
