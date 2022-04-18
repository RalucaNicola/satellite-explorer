import * as styles from './Satellite.module.css';

import { BackButton, InfoPanel } from '../index';

import { formatNumber, formatOrbitClass, kmToMiles } from '../../utils/utils';
import { observer } from 'mobx-react';
import satelliteStore from '../../stores/SatelliteStore';
import mapStore from '../../stores/MapStore';
import { useEffect, useState } from 'react';

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
  const [attr, setAttr] = useState(null);
  const [featured, setFeatured] = useState(null);
  useEffect(() => {
    if (satelliteStore.selectedSatellite) {
      setFeatured(satelliteStore.selectedSatellite.featuredSatellite);
      mapStore.setVisualizationType('satellite');
    }
    return () => {
      satelliteStore.setSelectedSatellite(null);
      satelliteStore.followSatellite = false;
    };
  }, []);

  useEffect(() => {
    if (satelliteStore.selectedSatellite) {
      setAttr(satelliteStore.selectedSatellite.metadata);
    }
  }, [satelliteStore.selectedSatellite]);

  return (
    <InfoPanel>
      <BackButton></BackButton>
      {attr ? (
        <div>
          <h2>{attr.official_name}</h2>
          {featured ? <p>{featured.info}</p> : <></>}
          <div className={styles.itemValue}>
            <div className={styles.positionInfo}>
              {!featured ? <img src='./assets/current_location.png' className={styles.legendImage}></img> : <></>}
              <span>Current satellite location on </span>{' '}
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(
                satelliteStore.currentTime
              )}
            </div>
            <div className={styles.centerButtonContainer}>
              <button
                className={styles.gotoButton}
                onClick={() => {
                  satelliteStore.gotoPosition('satellite');
                }}
              >
                Go to current location
              </button>{' '}
            </div>
            {featured ? (
              <div>
                Follow satellite
                <label className={styles.switchContainer}>
                  <input
                    type='checkbox'
                    defaultChecked={satelliteStore.followSatellite}
                    onChange={(event) => {
                      satelliteStore.followSatellite = event.target.checked;
                    }}
                  />
                  <span className={styles.roundSlider}></span>
                </label>
              </div>
            ) : (
              <></>
            )}
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
              <span>Perigee</span> - the satellite is {formatNumber(attr.perigee)} km /{' '}
              {formatNumber(kmToMiles(attr.perigee))} miles away from the Earth surface at its closest point on the
              orbit.{' '}
              <div className={styles.centerButtonContainer}>
                <button
                  className={styles.gotoButton}
                  onClick={() => {
                    satelliteStore.gotoPosition('perigee');
                  }}
                >
                  Go to perigee
                </button>
              </div>
            </div>
            <div className={styles.itemValue}>
              <img src='./assets/apogee.png' className={styles.legendImage}></img>
              <span>Apogee</span> - the satellite is {formatNumber(attr.apogee)} km /{' '}
              {formatNumber(kmToMiles(attr.apogee))} miles away from the Earth surface at its furthest point on the
              orbit.
              <div className={styles.centerButtonContainer}>
                <button
                  className={styles.gotoButton}
                  onClick={() => {
                    satelliteStore.gotoPosition('apogee');
                  }}
                >
                  Go to apoge
                </button>
              </div>
            </div>
            <div className={styles.inclinationContainer}>
              <img src='./assets/inclination.png' className={styles.inclinationImage}></img>
              <div>
                The satellite's orbit is inclined to{' '}
                <span className={styles.inclinationText}>{attr.inclination.toFixed(2)} degrees</span> from the Ecuator.
              </div>
            </div>
            <p>The satellite completes the rotation around the earth in {attr.period.toFixed(2)} minutes.</p>
          </ListItem>
        </div>
      ) : (
        <p>Loading satellite information...</p>
      )}
      <BackButton></BackButton>
    </InfoPanel>
  );
});
