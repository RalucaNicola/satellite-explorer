import * as styles from './SatellitesResults.module.css';
import { Link } from '../index';
import satelliteStore from '../../stores/SatelliteStore';

export const SatellitesResults = ({ satellites }) => {
  return (
    <ul className={styles.listResults}>
      {satellites.map((satellite, index) => {
        const attr = satellite.metadata;
        const date = new Date(attr.launch_date);
        return (
          <li key={index}>
            <Link
              toState={`satellite`}
              className={styles.satelliteLink}
              onClick={() => {
                satelliteStore.setSelectedSatellite(satellite);
              }}
            >
              <h5>{attr.official_name}</h5>
              <p>
                {attr.operator}, {attr.country_operator} | Launched on {date.toLocaleDateString('en-US')} | NORAD:{' '}
                {attr.norad}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
