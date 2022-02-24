import * as styles from './SatelliteUsage.module.css';
import { Link } from 'react-router-dom';
import { FilterButton } from '../FilterButton';
import { useState } from 'react';
import appStore from '../../stores/AppStore';

export function SatelliteUsage() {
  const [activeFilter, setActiveFilter] = useState(null);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    appStore.setVisualizationFilter(filter);
  };
  return (
    <div className={styles.menu}>
      <h2>Why do we need satellites?</h2>
      <p>
        Did you ever search for "restaurants near you" on your phone or set the navigation system in the car to guide
        you to a destination? Then you've used satellites. The{' '}
        <FilterButton filter='navigation' active={activeFilter === 'navigation'} clickHandler={handleFilter}>
          satellite navigation systems
        </FilterButton>{' '}
        determine the location, velocity and current time of small electronic receivers (like the ones in our smart
        phones). Many industries use information from navigation satellites. A few examples include banking to manage
        and synchronise transactions and authorise card activity. Emergency services like ambulances or fire fighters
        use navigation systems to locate and plan interventions. There are a few fully operational global navigation
        satellite systems (also called GNSS):
      </p>
      <p>
        <FilterButton filter='gps' active={activeFilter === 'gps'} clickHandler={handleFilter}>
          GPS
        </FilterButton>{' '}
        - the United States' Global Positioning System, originally Navstar GPS, was launched in 1973, by the U.S.
        Department of Defence.
      </p>
      <p>
        <FilterButton filter='glonass' active={activeFilter === 'glonass'} clickHandler={handleFilter}>
          GLONASS
        </FilterButton>{' '}
        - the Russian space based satellite navigation system. Its development began in 1976.
      </p>
      <p>
        <FilterButton filter='beidou' active={activeFilter === 'beidou'} clickHandler={handleFilter}>
          BeiDou
        </FilterButton>{' '}
        - the Chinese global navigation system. The first system was launched in 2000.
      </p>
      <p>
        <FilterButton filter='galileo' active={activeFilter === 'galileo'} clickHandler={handleFilter}>
          Galileo
        </FilterButton>{' '}
        - created by the European Union through the Europen Space Agency. It went live in 2016.
      </p>
      <Link to='/'>Back to homepage</Link>
    </div>
  );
}
