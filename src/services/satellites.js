import { twoline2satrec } from 'satellite.js';
import Papa from 'papaparse';
import { fields } from '../config';
import { convertToType } from '../utils/utils';
import metadataText from '/data/sat_metadata_012022.csv?raw';
import tleData from '/data/norad-tle.txt?raw';
import * as featuredSatellitesModule from '/data/featured_satellites.json?raw';

/**
 * Metadata for active satellites
 * Union of Concerned Scientists Satellite Database
 * 4550 satellites
 * https://www.ucsusa.org/resources/satellite-database
 */
const satellites = [];
const metadataCollection = {};
const result = Papa.parse(metadataText, { delimiter: ',' });
const metadata = result.data;
for (let i = 1; i < metadata.length; i++) {
  const item = metadata[i];
  const norad = Number(item[27]);
  metadataCollection[norad] = {};
  fields.forEach((field) => {
    metadataCollection[norad][field.name] = convertToType(item[field.metadataIndex], field.type);
  });
}

/**
 * Featured satellites - manually collected data
 */
const featuredSatellites = JSON.parse(featuredSatellitesModule.default);

/**
 * Active satellites TLE files
 * TLE format information: https://en.wikipedia.org/wiki/Two-line_element_set
 * Latest data on active satellites: https://celestrak.com/NORAD/elements/active.txt
 */
const tleLines = tleData.split('\n');
const count = (tleLines.length - (tleLines.length % 3)) / 3;
for (let i = 0; i < count; i++) {
  const line1 = tleLines[i * 3 + 0];
  const line2 = tleLines[i * 3 + 1];
  const line3 = tleLines[i * 3 + 2];
  if (!line1 || !line2 || !line3) {
    continue;
  }

  const satrec = twoline2satrec(line2, line3);
  if (!satrec) {
    continue;
  }
  const norad = Number(satrec.satnum);
  const inclination = (satrec.inclo * 180) / Math.PI;
  const period = (2 * Math.PI) / satrec.no;
  const eccentricity = (satrec.ecco * 180) / Math.PI;
  if (metadataCollection.hasOwnProperty(norad)) {
    satellites.push({
      norad,
      satrec,
      metadata: { ...metadataCollection[norad], inclination, period, eccentricity },
      featuredSatellite: featuredSatellites[norad]
    });
  }
}
export default satellites;
