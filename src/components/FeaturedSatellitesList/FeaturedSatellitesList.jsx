import * as styles from './FeaturedSatellitesList.module.css';
import { Link } from '../index';
import satelliteStore from '../../stores/SatelliteStore';

export const FeaturedSatellitesList = ({ satellites }) => {
  console.log(satellites);
  return (
    <ul className={styles.listResults}>
      {satellites.map((satellite, index) => {
        const name = satellite.metadata.official_name;
        const { shortInfo, image } = satellite.featuredSatellite;
        return (
          <li key={index}>
            <Link
              toState={`satellite`}
              className={styles.satelliteLink}
              onClick={() => {
                satelliteStore.setSelectedSatellite(satellite);
              }}
            >
              <div className={styles.info}>
                <div className={styles.imageContainer}>
                  <img src={image}></img>
                </div>
                <div>
                  <h5>{name}</h5>
                  <p>{shortInfo}</p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
