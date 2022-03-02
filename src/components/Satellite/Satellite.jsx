import * as styles from './Satellite.module.css';
import { useParams } from 'react-router-dom';
import appStore from '../../stores/AppStore';
import { observer } from 'mobx-react';
import { BackButton } from '../BackButton';

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
          <p>NORAD: {attr.norad}</p>
          <p>Operator: {attr.operator}</p>
        </>
      ) : (
        <p>Loading satellite information...</p>
      )}
    </div>
  );
});
