import * as styles from './Map.module.css';
import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import { whenFalseOnce } from '@arcgis/core/core/watchUtils';
import appStore from '../../stores/AppStore';

export const Map = ({ map }) => {
  const mapDiv = useRef(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    if (mapDiv.current && map) {
      const view = new SceneView({
        container: mapDiv.current,
        map: map,
        alphaCompositingEnabled: true,
        qualityProfile: 'high',
        environment: {
          background: {
            type: 'color',
            color: [0, 0, 0, 0]
          },
          starsEnabled: false,
          atmosphereEnabled: false,
          lighting: {
            cameraTrackingEnabled: false,
            directShadowsEnabled: false
          }
        },
        camera: {
          position: {
            x: 0,
            y: 20,
            z: 3e8
          },
          heading: 0,
          tilt: 0
        },
        constraints: {
          altitude: {
            min: 1e6,
            max: 1e9
          },
          clipDistance: {
            mode: 'manual',
            near: 1e5,
            far: 1e9 + 5e10
          }
        }
      });
      whenFalseOnce(view, 'updating', () => {
        appStore.setViewReady(true);
        setView(view);
      });
    }
  }, [map]);

  useEffect(() => {
    if (view) {
      view.goTo({ zoom: 3 }, { speedFactor: 0.1 });
    }
  }, [view]);

  return <div className={styles.mapDiv} ref={mapDiv}></div>;
};
