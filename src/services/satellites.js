import { twoline2satrec } from 'satellite.js';
import { fields, satelliteLayerServiceUrl } from '../config';
import { convertToType } from '../utils/utils';
import * as featuredSatellitesModule from '/data/featured_satellites.json?raw';
import * as query from '@arcgis/core/rest/query';

const loadSatellites = async () => {
  /**
   * Get metadata for active satellites
   * Union of Concerned Scientists Satellite Database
   * https://www.ucsusa.org/resources/satellite-database
   */
  const satellites = [];
  const metadataCollection = {};
  const { features } = await query.executeQueryJSON(satelliteLayerServiceUrl, {
    where: '1=1',
    outFields: ['*'],
    maxRecordCountFactor: 5
  });
  for (let i = 1; i < features.length; i++) {
    const item = features[i].attributes;
    const { norad } = item;
    metadataCollection[norad] = {};
    fields.forEach((field) => {
      metadataCollection[norad][field.name] = convertToType(item[field.name], field.type);
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
  const tleResponse = await fetch('./data/active.txt');
  const tleData = await tleResponse.text();
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
  return satellites;
};

export default loadSatellites;
