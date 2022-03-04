import * as styles from './Satellite.module.css';
import appStore from '../../stores/AppStore';
import { observer } from 'mobx-react';
import { BackButton } from '../BackButton';
import { formatOrbitClass } from '../../utils/utils';

const ListItem = ({ field, value, children }) => {
  return (
    <>
      {value ? (
        <>
          <p className={styles.itemTitle}>{field.toUpperCase()}</p>
          <p className={styles.itemValue}>{value}</p>
          {children}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export const Satellite = observer(() => {
  let attr = null;
  if (appStore.selectedSatellite) {
    attr = appStore.selectedSatellite.metadata;
  }

  return (
    <div className={styles.menu}>
      <BackButton navigateTo={appStore.inSearch ? -1 : '/'}></BackButton>
      {attr ? (
        <>
          <h2>{attr.official_name}</h2>
          <ListItem field='Purpose' value={attr.purpose} />
          <ListItem field='Operator / Owner' value={attr.operator} />
          <ListItem field='Country' value={attr.country_operator} />
          <ListItem field='Launch date' value={new Date(attr.launch_date).toLocaleDateString('en-US')} />
          <ListItem field='Launch location' value={attr.launch_site} />
          <ListItem field='Launch vehicle' value={attr.launch_vehicle} />
          <ListItem field='Orbital parameters' value={formatOrbitClass(attr.orbit_class)}>
            <div>
              <img src='./assets/current_location.png' className={styles.legendImage}></img>
              Current satellite location.
            </div>
            <div>
              <img src='./assets/perigee.png' className={styles.legendImage}></img>
              <span>Perigee</span> - the satellite is {attr.perigee} km away from the Earth surface at its closest point
              on the orbit.
            </div>
            <div>
              <img src='./assets/apogee.png' className={styles.legendImage}></img>
              <span>Apogee</span> - the satellite is {attr.apogee} km away from the Earth surface at its furthest point
              on the orbit.
            </div>
            <div className={styles.inclinationContainer}>
              <img src='./assets/inclination.png' className={styles.inclinationImage}></img>
              <div>
                The satellite's orbit is inclined to{' '}
                <span className={styles.inclinationText}>{attr.inclination} degrees</span> from the Ecuator.
              </div>
            </div>
            <div>The satellite completes the rotation around the earth in {attr.period} minutes.</div>
          </ListItem>
        </>
      ) : (
        <p>Loading satellite information...</p>
      )}
    </div>
  );
});
