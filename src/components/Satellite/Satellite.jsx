import * as styles from './Satellite.module.css';

import { BackButton } from '../index';

import { formatOrbitClass } from '../../utils/utils';
import appStore from '../../stores/AppStore';
import mapStore from '../../stores/MapStore';
import { observer } from 'mobx-react';

const ListItem = ({ field, value, children }) => {
  return (
    <>
      <p className={styles.itemTitle}>{field.toUpperCase()}</p>
      {value ? <p className={styles.itemValue}>{value}</p> : ''}
      {children}
    </>
  );
};

export const Satellite = observer(() => {
  let attr = null;
  let featured = null;
  if (appStore.selectedSatellite) {
    attr = appStore.selectedSatellite.metadata;
    featured = appStore.selectedSatellite.featuredSatellite;
  }

  return (
    <div className={styles.menu}>
      <BackButton></BackButton>
      {attr ? (
        <div>
          <h2>{attr.official_name}</h2>
          {featured ? <p>{featured.info}</p> : <></>}
          <div className={styles.itemValue}>
            <img src='./assets/current_location.png' className={styles.legendImage}></img>
            Current satellite location on{' '}
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(
              mapStore.currentTime
            )}.{' '}
            <button
              className={styles.gotoButton}
              onClick={() => {
                mapStore.gotoPosition('satellite');
              }}
            >
              Go to current location
            </button>{' '}
            {featured ? <button className={styles.gotoButton}>Follow satellite</button> : <></>}
          </div>
          {featured ? (
            <div className={styles.itemValue}>
              <ListItem field='Links'>
                {featured.links.map((link, index) => {
                  return (
                    <a key={index} className={styles.newsLink} target='_blank' href={link.url}>
                      {link.title}
                    </a>
                  );
                })}
              </ListItem>
            </div>
          ) : (
            <></>
          )}

          <ListItem field='Purpose' value={attr.purpose} />
          <ListItem field='Operator / Owner' value={attr.operator} />
          <ListItem field='Country' value={attr.country_operator} />
          <ListItem field='Launch date' value={new Date(attr.launch_date).toLocaleDateString('en-US')} />
          <ListItem field='NORAD' value={attr.norad} />
          <ListItem field='Launch location' value={attr.launch_site} />
          <ListItem field='Launch vehicle' value={attr.launch_vehicle} />
          <ListItem field='Orbital parameters' value={formatOrbitClass(attr.orbit_class)}>
            <div className={styles.itemValue}>
              <img src='./assets/perigee.png' className={styles.legendImage}></img>
              <span>Perigee</span> - the satellite is {attr.perigee} km away from the Earth surface at its closest point
              on the orbit.{' '}
              <button
                className={styles.gotoButton}
                onClick={() => {
                  mapStore.gotoPosition('perigee');
                }}
              >
                Go to perigee
              </button>
            </div>
            <div className={styles.itemValue}>
              <img src='./assets/apogee.png' className={styles.legendImage}></img>
              <span>Apogee</span> - the satellite is {attr.apogee} km away from the Earth surface at its furthest point
              on the orbit.
              <button
                className={styles.gotoButton}
                onClick={() => {
                  mapStore.gotoPosition('apogee');
                }}
              >
                Go to apogee
              </button>
            </div>
            <div className={styles.inclinationContainer}>
              <img src='./assets/inclination.png' className={styles.inclinationImage}></img>
              <div>
                The satellite's orbit is inclined to{' '}
                <span className={styles.inclinationText}>{attr.inclination} degrees</span> from the Ecuator.
              </div>
            </div>
            <p>The satellite completes the rotation around the earth in {attr.period.toFixed(2)} minutes.</p>
          </ListItem>
        </div>
      ) : (
        <p>Loading satellite information...</p>
      )}
      <BackButton></BackButton>
    </div>
  );
});
