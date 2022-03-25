import * as styles from './Map.module.css';

import SceneView from '@arcgis/core/views/SceneView';

import { whenFalseOnce } from '@arcgis/core/core/watchUtils';

import Home from '@arcgis/core/widgets/Home';
import Viewpoint from '@arcgis/core/Viewpoint';

import appStore from '../../stores/AppStore';

import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import mapStore from '../../stores/MapStore';

const initialCamera = {
  position: {
    x: 0,
    y: 20,
    z: 2e8
  },
  heading: 0,
  tilt: 0
};

export const Map = observer(() => {
  const mapDiv = useRef(null);

  useEffect(async () => {
    // initializing the view
    if (mapDiv.current && mapStore.map) {
      const map = mapStore.map;
      const view = new SceneView({
        container: mapDiv.current,
        map: map,
        qualityProfile: 'high',
        environment: {
          starsEnabled: true,
          atmosphereEnabled: true,
          lighting: {
            type: 'sun',
            directShadowsEnabled: false
          }
        },
        popup: {
          defaultPopupTemplateEnabled: true
        },
        constraints: {
          altitude: {
            max: 1e9
          },
          clipDistance: {
            mode: 'manual',
            near: 1e5,
            far: 1e9 + 5e10
          }
        }
      });
      view.ui.empty('top-left');
      view.ui.add(['navigation-toggle', 'compass', 'zoom'], 'top-right');
      let homeWidget = new Home({
        view: view,
        viewpoint: new Viewpoint({
          camera: initialCamera
        })
      });
      view.ui.add(homeWidget, 'top-right');

      whenFalseOnce(view, 'updating', () => {
        mapStore.setView(view);
        appStore.setIsLoading(false);
        view.goTo(initialCamera, { speedFactor: 0.3 });
      });
    }
  }, [mapStore.map]);

  return (
    <>
      <div className={styles.mapDiv} ref={mapDiv}></div>
    </>
  );
});
