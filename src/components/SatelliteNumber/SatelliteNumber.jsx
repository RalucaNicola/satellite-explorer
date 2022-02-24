import * as styles from './SatelliteNumber.module.css';
import { Link } from 'react-router-dom';

export function SatelliteNumber() {
  return (
    <div className={styles.menu}>
      <h2>How many satellites are out there?</h2>
      <Link to='/'>Back to homepage</Link>
    </div>
  );
}
