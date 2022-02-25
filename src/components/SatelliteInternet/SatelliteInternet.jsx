import * as styles from './SatelliteInternet.module.css';
import { Link } from 'react-router-dom';

export function SatelliteInternet() {
  return (
    <div className={styles.menu}>
      <h2>Internet for everyone, everywhere?</h2>
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
