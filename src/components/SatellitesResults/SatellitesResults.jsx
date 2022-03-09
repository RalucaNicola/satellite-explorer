import * as styles from './SatellitesResults.module.css';
import { Link } from 'react-router-dom';

export const SatellitesResults = ({ satellites }) => {
  return (
    <ul className={styles.listResults}>
      {satellites.map((satellite, index) => {
        const attr = satellite.metadata;
        const date = new Date(attr.launch_date);
        return (
          <li key={index}>
            <Link to={`/${satellite.norad}`} className={styles.satelliteLink}>
              <h5>{attr.official_name}</h5>
              <p>
                {attr.operator}, {attr.country_operator} - {attr.launch_site}, {date.toLocaleDateString('en-US')}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
