import * as styles from './SatelliteOrbits.module.css';
import { OrbitsChart } from '../OrbitsChart';
import { useEffect, useState } from 'react';
import appStore from '../../stores/AppStore';
import { BackButton } from '../BackButton';
import { FilterButton } from '../FilterButton';
import { filterDefinition } from '../../config';

const leo = filterDefinition.leo.id;
const meo = filterDefinition.meo.id;
const geo = filterDefinition.geo.id;

export function SatelliteOrbits() {
  const [countsByOrbit, setCountsByOrbit] = useState(null);
  const [activeFilter, setActiveFilter] = useState(false);
  useEffect(() => {
    if (appStore.data) {
      setCountsByOrbit(appStore.getCountsByOrbit());
    }
  }, [appStore.data]);
  const handleFilter = ({ filter }) => {
    setActiveFilter(filter);
    const filterExpression = filterDefinition[filter].expression;
    appStore.setMapFilter(filterExpression);
  };
  return (
    <div className={styles.menu}>
      <BackButton></BackButton>
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
        <p className={styles.orbitTitle}>160 km / 111 miles</p>
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
        <p className={styles.orbitTitle}>2,000 km / 1,243 miles</p>
        <div className={styles.orbitContent}>
          <FilterButton filter={meo} active={activeFilter === meo} clickHandler={handleFilter}>
            Medium Earth Orbit satellites
          </FilterButton>{' '}
          - navigation satellite systems (like the ones used by our car's GPS) work well at this altitude. Being so high
          up they can see more of the Earth's surface at a time.
        </div>
      </div>
      <p className={styles.orbitTitle}>36,000 km / 22,369 miles</p>
      <div className={styles.block}>
        <p className={styles.orbitTitle}>37,786 km / 23,479 miles</p>
        <div className={styles.orbitContent}>
          <FilterButton filter={geo} active={activeFilter === geo} clickHandler={handleFilter}>
            Geosynchronous Orbit satellites
          </FilterButton>{' '}
          - navigation satellite systems (like the ones used by our car's GPS) work well at this altitude. Being so high
          up they can see more of the Earth's surface at a time.
        </div>
      </div>
      <p className={styles.orbitTitle}>37,786 km / 23,479 miles</p>

      <BackButton></BackButton>
    </div>
  );
}
