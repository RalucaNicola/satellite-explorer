import { twoline2satrec, propagate, gstime, eciToGeodetic, radiansToDegrees } from './satellite.es.js';
import Polyline from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polyline.js';
import Point from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Point.js';
import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js';
import FeatureLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/FeatureLayer.js';

(async function () {
  // testEnv is true when testing if the update works
  // when updating the production service it should be false
  const testEnv = true;
  const satURL = testEnv
    ? 'https://services9.arcgis.com/FF3qnCUixr5w9JQi/arcgis/rest/services/satellite_orbits_updates_test/FeatureServer'
    : 'https://services9.arcgis.com/FF3qnCUixr5w9JQi/arcgis/rest/services/satellite_orbits/FeatureServer';
  const satellites = [];
  const norad_important_satellites = [
    49260, // Landsat 9
    39084, // Landsat 8
    25544 // ISS
  ];
  const debris = [];
  const NOW = new Date();
  let unique = 0;
  const satelliteLayer = new FeatureLayer({
    url: satURL
  });
  const debrisLayer = new FeatureLayer({
    url: 'https://services9.arcgis.com/FF3qnCUixr5w9JQi/arcgis/rest/services/Debris/FeatureServer'
  });

  // double check if the keys are correct,
  // sometimes they change the field names in the UCS Satellite database
  const keys = {
    norad: 'NORAD Number',
    official_name: 'Current Official Name of Satellite',
    name: 'Name of Satellite, Alternate Names',
    country_operator: 'Country of Operator/Owner',
    operator: 'Operator/Owner',
    purpose: 'Purpose',
    orbit_class: 'Class of Orbit',
    orbit_type: 'Type of Orbit',
    perigee: 'Perigee (km)',
    apogee: 'Apogee (km)',
    launch_date: 'Date of Launch',
    launch_site: 'Launch Site',
    cospar: 'COSPAR Number'
  };

  async function main() {
    // Uncomment these lines to see that the updates of metadata and orbit prediction look ok
    // await loadSatelliteData();
    // console.log(`${satellites.length} satellites that matched both lists`);
    // const sat = satellites[0];
    // console.log('Showing first satellite results: ', sat, getOrbit(sat.satrec, sat.metadata.period, NOW));

    // Uncomment this line to update the satellites feature layer
    updateSatellites();
    // Debris doesn't need to be updated, the actual location doesn't matter too much
    // updateDebris();
  }

  main();

  // deletes features in the satellite feature layer and adds the updated ones
  async function updateSatellites() {
    await loadSatelliteData();
    satelliteLayer
      .queryObjectIds()
      .then((results) => {
        console.log(`Deleting ${results.lenght} features...`);
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

  async function loadSatelliteData() {
    const metadataResponse = await fetch('../data/sat_metadata_052022.csv');
    const metadata = await metadataResponse.text();
    const mu = 398600.5;
    const infoCollection = {};
    const result = Papa.parse(metadata, { delimiter: ',', header: true });
    console.log(`${result.data.length} satellites in the metadata`);
    for (let i = 1; i < result.data.length; i++) {
      const item = result.data[i];
      const norad = Number(item[keys.norad]);
      infoCollection[norad] = {
        name: item[keys.name],
        official_name: item[keys.official_name],
        country_operator: item[keys.country_operator],
        operator: item[keys.operator],
        purpose: item[keys.purpose],
        orbit_class: item[keys.orbit_class],
        orbit_type: item[keys.orbit_type],
        perigee: Number(item[keys.perigee].replaceAll("'", '')),
        apogee: Number(item[keys.apogee].replaceAll("'", '')),
        date: item[keys.launch_date],
        launch_date: formatDate(item[keys.launch_date]),
        launch_site: item[keys.lauch_site],
        cospar: item[keys.cospar],
        norad
      };
    }
    const tleResponse = await fetch('../public/data/active.txt');
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
    console.log(`${uniqueSatelliteIDs.length} satellites in the tle data`);
  }

  /*********************************
   * This method creates graphics and updates feature service
   *
   * Because some orbits overlap and we need to take care of performance
   * we add a display property so that we only show one orbit out of the ones
   * that are similar (display: 1 -> show orbit; display: 0 -> don't show).
   * The layer has a definitionExpression using the display property.
   * This reduces the number of displayed orbits to half.
   *
   * Some satellites marked as important should not be affected by this and
   * should have the display property set to 1
   ***********************/
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
      if (norad_important_satellites.includes(sat.norad)) {
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
        console.log('Added features: ', result, `A total of ${unique} features are visible.`);
        if (satellites.length - start > 0) {
          addSatellites(start);
        }
      })
      .catch(console.error);
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
})();

function formatDate(stringDate) {
  const [day, month, year] = stringDate.split('.');
  const formattedYear = Number(year) > 25 ? `19${year}` : `20${year}`;
  const isoDate = `${formattedYear}-${month}-${day}`;
  return new Date(isoDate);
}

function areSimilar(value1, value2) {
  if (Math.abs(value1 - value2) > 5) {
    return false;
  }
  return true;
}
