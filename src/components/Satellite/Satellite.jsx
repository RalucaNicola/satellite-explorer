import * as styles from './Satellite.module.css';
import { useParams } from 'react-router-dom';
import appStore from '../../stores/AppStore';

export function Satellite() {
  let params = useParams();
  const selectedSatellite = appStore.data.filter((satellite) => satellite.norad === parseInt(params.noradID))[0];
  const attr = selectedSatellite.metadata;
  return (
    <>
      <h2>{attr.official_name}</h2>
      <p>NORAD: {attr.norad}</p>
      <p>Operator: {attr.operator}</p>
    </>
  );
}
