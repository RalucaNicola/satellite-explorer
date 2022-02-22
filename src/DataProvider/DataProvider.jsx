// https://spin.atomicobject.com/2020/04/15/react-context-data-provider-pattern/

import { createContext, useContext, useEffect, useState } from 'react';
import { twoline2satrec } from 'satellite.js';
import Papa from 'papaparse';

const DataContext = createContext([]);

export const useData = () => {
  const dataContext = useContext(DataContext);
  if (dataContext === null) {
    throw new Error('useData can only be used within a DataContext');
  }
  return dataContext;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    (async () => {
      /**
       * Metadata for active satellites
       * Union of Concerned Scientists Satellite Database
       * 4550 satellites
       * https://www.ucsusa.org/resources/satellite-database
       */
      const satellites = [];
      const metadataCollection = {};
      const metadataResponse = await fetch('../../data/sat_metadata.csv');
      const metadataText = await metadataResponse.text();
      const result = Papa.parse(metadataText, { delimiter: ',' });
      const metadata = result.data;
      for (let i = 1; i < metadata.length; i++) {
        const item = metadata[i];
        const norad = Number(item[27]);
        metadataCollection[norad] = {
          name: item[1],
          official_name: item[2],
          country_UN_registry: item[3],
          country_operator: item[4],
          operator: item[5],
          users: item[6],
          purpose: item[7],
          detailed_purpose: item[8],
          orbit_class: item[9],
          orbit_type: item[10],
          perigee: item[12],
          apogee: item[13],
          eccentricity: item[14],
          inclination: item[15],
          period: item[16],
          launch_mass: item[17],
          dry_mass: item[18],
          power: item[19],
          launch_date: item[20],
          expected_lifetime: item[21],
          contractor: item[22],
          launch_site: item[24],
          launch_vehicle: item[25],
          cospar: item[26],
          norad,
          source_orbital_data: item[28],
          source: item[29]
        };
      }
      /**
       * Active satellites TLE files
       * TLE format information: https://en.wikipedia.org/wiki/Two-line_element_set
       * Latest data on active satellites: https://celestrak.com/NORAD/elements/active.txt
       */
      const tleResponse = await fetch('../../data/norad-tle.txt');
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

        if (metadataCollection.hasOwnProperty(norad)) {
          satellites.push({
            norad,
            satrec,
            metadata: metadataCollection[norad]
          });
        }
      }

      setData(satellites);
    })();
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};
