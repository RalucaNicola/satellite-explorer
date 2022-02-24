import * as styles from './Map.module.css';
import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import { whenFalseOnce } from '@arcgis/core/core/watchUtils';
import appStore from '../../stores/AppStore';
import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import { filterDefinition } from '../../config';
import { setRenderers } from '../../utils/utils';

export const Map = observer(() => {
  const mapDiv = useRef(null);
  const [view, setView] = useState(null);
  const [layers, setLayers] = useState(null);
  const [layerViews, setLayerViews] = useState(null);

  useEffect(() => {
    // setting the map once it's ready
    reaction(
      () => appStore.map,
      async (map) => {
        if (mapDiv.current && map) {
          const view = new SceneView({
            container: mapDiv.current,
            map: map,
            qualityProfile: 'high',
            environment: {
              starsEnabled: true,
              atmosphereEnabled: true,
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
            popup: {
              defaultPopupTemplateEnabled: true
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
          // get access to layers/layerViews on the component level
          const orbitFL = map.allLayers.find((layer) => layer.id === 'orbit');
          const satelliteFL = map.allLayers.find((layer) => layer.id === 'satellite');
          setLayers([orbitFL, satelliteFL]);
          setRenderers([orbitFL, satelliteFL], appStore.location);
          const orbitLV = await view.whenLayerView(orbitFL);
          const satelliteLV = await view.whenLayerView(satelliteFL);
          setLayerViews([orbitLV, satelliteLV]);

          whenFalseOnce(view, 'updating', () => {
            appStore.setViewReady(true);
            setView(view);
          });
        }
      }
    );
  }, []);
  useEffect(() => {
    if (layerViews) {
      // setting filters when they change
      reaction(
        () => appStore.visualizationFilter,
        (visualizationFilter) => {
          let filterExpression = null;
          if (visualizationFilter) {
            filterExpression = filterDefinition[visualizationFilter].expression;
          }
          layerViews.forEach((lyrView) => (lyrView.filter = { where: filterExpression }));
        }
      );
    }
  }, [layerViews]);

  useEffect(() => {
    if (layers) {
      reaction(
        () => appStore.location,
        (location) => {
          setRenderers(layers, location);
        }
      );
    }
  }, [layers]);

  useEffect(() => {
    if (view) {
      view.goTo({ zoom: 3 }, { speedFactor: 0.1 });
    }
  }, [view]);

  return (
    <>
      <div className={styles.mapDiv} ref={mapDiv}></div> <Outlet />
    </>
  );
});
