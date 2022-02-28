import * as styles from './SatelliteInternet.module.css';
import { Link } from 'react-router-dom';

export function SatelliteInternet() {
  return (
    <div className={styles.menu}>
      <h2>Internet for everyone, everywhere?</h2>

      <Link to='/'>Back to homepage</Link>
    </div>
  );
}
