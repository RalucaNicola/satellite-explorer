import { twoline2satrec, propagate, gstime, eciToGeodetic, radiansToDegrees } from './satellite.es.js';
import Polyline from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polyline.js';
import Point from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Point.js';
import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js';
import FeatureLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/FeatureLayer.js';
(async function () {
  const satellites = [];
  const debris = [];
  const NOW = new Date();
  let unique = 0;
  const satelliteLayer = new FeatureLayer({
    url: 'https://services9.arcgis.com/FF3qnCUixr5w9JQi/arcgis/rest/services/satellite_orbits/FeatureServer'
  });
  const debrisLayer = new FeatureLayer({
    url: 'https://services9.arcgis.com/FF3qnCUixr5w9JQi/arcgis/rest/services/Debris/FeatureServer'
  });
  async function loadSatelliteData() {
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
        // country_UN_registry: items[3],
        country_operator: items[4],
        operator: items[5],
        // users: items[6],
        purpose: items[7],
        // detailed_purpose: items[8],
        orbit_class: items[9],
        orbit_type: items[10],
        perigee: items[12],
        apogee: items[13],
        //eccentricity: items[14],
        //inclination: items[15],
        //period: items[16],
        // launch_mass: items[17],
        // dry_mass: items[18],
        // power: items[19],
        launch_date: items[20],
        // expected_lifetime: items[21],
        // contractor: items[22],
        launch_site: items[24],
        // launch_vehicle: items[25],
        cospar: items[26],
        norad: items[27]
      };
    }
    const tleResponse = await fetch('../public/data/norad-tle-test.txt');
    const tleData = await tleResponse.text();
    const lines = tleData.split('\n');
    const count = (lines.length - (lines.length % 3)) / 3;

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
        // if (infoCollection.hasOwnProperty(norad)) {
        const sat = {
          norad,
          satrec,
          metadata: {
            inclination: (satrec.inclo * 180) / Math.PI,
            period: (2 * Math.PI) / satrec.no,
            eccentricity: (satrec.ecco * 180) / Math.PI,
            perigee_argument: (satrec.argpo * 180) / Math.PI,
            node: (satrec.nodeo * 180) / Math.PI
            // ...infoCollection[norad]
          }
        };
        satellites.push(sat);
        // }
      }
    }
  }

  function getSatelliteLocation(satrec, date) {
    const propagation = propagate(satrec, date);
    const position = propagation?.position;
    console.log(position);
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

  function areSimilar(value1, value2) {
    if (Math.abs(value1 - value2) > 5) {
      return false;
    }
    return true;
  }

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
      if (sat.norad == 39084) {
        display = 1;
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

  async function updateSatellites() {
    await loadSatelliteData();
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
  }

  async function loadDebrisData() {
    const tleResponse = await fetch('./data/debris.txt');
    const tleData = await tleResponse.text();
    const lines = tleData.split('\n');
    const count = (lines.length - (lines.length % 3)) / 3;

    const uniqueDebrisIDs = [];
    for (let i = 0; i < count; i++) {
      const line1 = lines[i * 3 + 0];
      const line2 = lines[i * 3 + 1];
      const line3 = lines[i * 3 + 2];
      if (!line1 || !line2 || !line3) {
        continue;
      }
      const name = line1;
      const satrec = twoline2satrec(line2, line3);
      if (!satrec) {
        continue;
      }
      const norad = Number.parseInt(satrec.satnum, 10);
      if (uniqueDebrisIDs.indexOf(norad) === -1) {
        uniqueDebrisIDs.push(norad);
        const deb = {
          norad,
          satrec,
          metadata: {
            name,
            period: (2 * Math.PI) / satrec.no
          }
        };
        debris.push(deb);
      }
    }
  }

  function addDebris(start) {
    const debrisGraphics = [];
    for (let index = start; index < start + 1000; index++) {
      if (index >= debris.length) {
        break;
      }
      const deb = debris[index];
      const { satrec, metadata } = deb;

      const location = getSatelliteLocation(satrec, NOW);
      const attributes = {
        index,
        ...metadata
      };
      const debrisGraphic = new Graphic({
        attributes,
        geometry: new Point(location)
      });
      debrisGraphics.push(debrisGraphic);
    }

    debrisLayer
      .applyEdits({
        addFeatures: debrisGraphics
      })
      .then((result) => {
        start = start + 1000;
        console.log('Added features: ', result);
        if (debris.length - start > 0) {
          addDebris(start);
        }
      })
      .catch(console.error);
  }

  async function updateDebris() {
    await loadDebrisData();
    debrisLayer
      .queryObjectIds()
      .then((results) => {
        const deleteFeatures = results.map((id) => {
          return {
            objectId: id
          };
        });
        debrisLayer
          .applyEdits({ deleteFeatures })
          .then((result) => {
            console.log('Deleted features: ', result);
            console.log('Adding new features...');
            addDebris(0);
          })
          .catch(console.error);
      })
      .catch(console.error);
  }

  async function main() {
    await loadSatelliteData();
    const sat = satellites[0];
    console.log(sat);
    getOrbit(sat.satrec, sat.metadata.period, NOW);
    //updateSatellites();
    //updateDebris();
  }

  main();
})();
