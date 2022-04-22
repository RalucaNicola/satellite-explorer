import * as styles from './SatelliteOrbits.module.css';

import { BackButton, FilterButton, OrbitsChart, InfoPanel } from '../index';

import { filterDefinition } from '../../config';
import { kmToMiles, formatNumber } from '../../utils/utils';
import dataStore from '../../stores/DataStore';
import mapStore from '../../stores/MapStore';

import { useEffect, useState } from 'react';

const leo = 'leo';
const meo = 'meo';
const geo = 'geo';
const heo = 'heo';
const molniya = 'molniya';
const geostationary = 'geostationary';

export function SatelliteOrbits() {
  const [activeFilter, setActiveFilter] = useState(false);
  const { countsByOrbit } = dataStore;
  useEffect(() => {
    mapStore.setVisualizationType('orbits');
    mapStore.drawOrbitRanges(true);
    mapStore.setMapFilter('1=2');
    mapStore.goToPosition('home');
    return () => {
      mapStore.drawOrbitRanges(false);
      mapStore.setMapFilter(null);
    };
  }, []);
  const handleFilter = ({ filter }) => {
    setActiveFilter(filter);
    const filterExpression = filterDefinition[filter].expression;
    mapStore.setMapFilter(filterExpression);
    mapStore.emphasizeOrbitRange(filter);
    mapStore.goToPosition(filter);
  };
  return (
    <InfoPanel>
      <BackButton toState='general'></BackButton>
      <h2>What is the altitude of a satellite?</h2>
      <div className={styles.block}>
        Although the space beyond Earth's atmosphere is vast, human-man satellites are typically located in one of the
        three popular orbital regimes:
        {countsByOrbit ? (
          <>
            <OrbitsChart data={countsByOrbit} type='leo' title='LEO (Low Earth Orbit)'></OrbitsChart>
            <OrbitsChart data={countsByOrbit} type='meo' title='MEO (Medium Earth Orbit)'></OrbitsChart>
            <OrbitsChart data={countsByOrbit} type='geo' title='GEO (Geosynchronous Orbit)'></OrbitsChart>
          </>
        ) : (
          ''
        )}
      </div>
      <div className={styles.block}>
        <p className={styles.orbitTitle}>160 km / {kmToMiles(160)} miles</p>
        <div className={styles.orbitContent}>
          <FilterButton filter={leo} active={activeFilter === leo} clickHandler={handleFilter}>
            Low Earth Orbit satellites
          </FilterButton>{' '}
          - typically take between 90 minutes and 2 hours to complete one full orbit around the Earth. Low altitudes in
          combination with short orbital periods make LEO satellites ideally situated for remote sensing missions,
          including Earth observation and reconnaissance.
        </div>
      </div>
      <div className={styles.block}>
        <p className={styles.orbitTitle}>2,000 km / {formatNumber(kmToMiles(2000))} miles</p>
        <div className={styles.orbitContent}>
          <FilterButton filter={meo} active={activeFilter === meo} clickHandler={handleFilter}>
            Medium Earth Orbit satellites
          </FilterButton>{' '}
          - navigation satellite systems (like the ones used by our car's GPS) work well at this altitude. Being so high
          up they have larger footprints and can see more of the Earth's surface at a time. One reason there are fewer
          satellites in this region is the presence of the Van Allen Radiation Belt, which can damage satellites'
          onboard electronic systems.
        </div>
      </div>
      <p className={styles.orbitTitle}>35,000 km / {formatNumber(kmToMiles(35000))} miles</p>
      <div className={styles.block}>
        <p className={styles.orbitTitle}>35,786 km / {formatNumber(kmToMiles(35786))} miles</p>
        <div className={styles.orbitContent}>
          <FilterButton filter={geo} active={activeFilter === geo} clickHandler={handleFilter}>
            Geosynchronous Orbit satellites
          </FilterButton>{' '}
          - have an orbital period that matches Earth's rotation around its axis. These satellites have a constant
          altitude of 35,786km (22,236 miles). A special case of geosynchronous orbit is the{' '}
          <FilterButton filter={geostationary} active={activeFilter === geostationary} clickHandler={handleFilter}>
            geostationary orbit
          </FilterButton>{' '}
          which is a circular geosynchronous orbit in Earth's equatorial plane (their inclination is zero).
        </div>
      </div>
      <p className={styles.orbitTitle}>35,786 km / {formatNumber(kmToMiles(35786))} miles</p>

      <div className={styles.block}>
        <FilterButton filter={heo} active={activeFilter === heo} clickHandler={handleFilter}>
          Highly Elliptical Orbit satellites
        </FilterButton>{' '}
        orbit the Earth on a long elliptical path. These satellites spend a significantly greater portion of time over
        one hemisphere or the other. For example, the{' '}
        <FilterButton filter={molniya} active={activeFilter === molniya} clickHandler={handleFilter}>
          Molniya orbits
        </FilterButton>{' '}
        are designed to provide communications and remote sensing coverage over high latitudes.
      </div>
      <BackButton toState='general'></BackButton>
    </InfoPanel>
  );
}
