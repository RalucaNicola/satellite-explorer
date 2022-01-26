import * as styles from './Map.module.css';
import { useEffect, useRef } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import WebScene from '@arcgis/core/WebScene';

export function Map() {
  const mapDiv = useRef(null);

  useEffect(() => {
    if (mapDiv.current) {
      const webscene = new WebScene({
        portalItem: {
          id: '5f37df175f424207a4689220675c741a'
        }
      });

      new SceneView({
        container: mapDiv.current,
        map: webscene
      });
    }
  }, []);
  return <div className={styles.mapDiv} ref={mapDiv}></div>;
}
