import * as styles from './SatelliteUsage.module.css';
import { Link } from 'react-router-dom';

export function SatelliteUsage() {
  return (
    <div className={styles.menu}>
      <h2>Why do we need satellites?</h2>
      <Link to='/'>Back to homepage</Link>
    </div>
  );
}
