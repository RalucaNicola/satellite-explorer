import * as styles from './SatellitesResults.module.css';
import { Link } from '../index';
import appStore from '../../stores/AppStore';

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
                appStore.setSelectedSatellite(satellite);
              }}
            >
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
