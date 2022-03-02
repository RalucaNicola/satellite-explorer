import * as styles from './Satellite.module.css';
import { useParams } from 'react-router-dom';
import appStore from '../../stores/AppStore';
import { observer } from 'mobx-react';
import { BackButton } from '../BackButton';

const ListItem = ({ field, value }) => {
  return (
    <>
      {value ? (
        <>
          <p className={styles.itemTitle}>{field.toUpperCase()}</p>
          <p className={styles.itemValue}>{value}</p>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export const Satellite = observer(() => {
  let params = useParams();

  let attr = null;
  if (appStore.data) {
    const selectedSatellite = appStore.data.filter((satellite) => satellite.norad === parseInt(params.noradID))[0];
    attr = selectedSatellite.metadata;
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
          <ListItem field='Orbit type' value={attr.orbit_class} />
          <ListItem field='Perigee' value={attr.perigee} />
          <ListItem field='Apogee' value={attr.apogee} />
          <ListItem field='Eccentricity' value={attr.exccentricity} />
          <ListItem field='Inclination' value={attr.inclination} />
          <ListItem field='Period' value={attr.period} />
        </>
      ) : (
        <p>Loading satellite information...</p>
      )}
    </div>
  );
});
