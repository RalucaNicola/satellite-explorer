import * as styles from './Map.module.css';
import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import { whenFalseOnce } from '@arcgis/core/core/watchUtils';
import appStore from '../../stores/AppStore';
import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';

import {
  getGeneralLineRenderer,
  getGeneralPointRenderer,
  getUsageLineRenderer,
  getUsagePointRenderer,
  getUsageConstellationsPointRenderer,
  getUsageConstellationsLineRenderer,
  getUsageLabelingInfo
} from '../../utils/utils';

export const Map = observer(() => {
  const mapDiv = useRef(null);
  const [view, setView] = useState(null);
  const [layers, setLayers] = useState(null);
  const [layerViews, setLayerViews] = useState(null);

  useEffect(() => {
    // initializing the view
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
          setVisualization(appStore.visualizationType, [orbitFL, satelliteFL]);
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
      if (appStore.mapFilter) {
        setMapFilter(appStore.mapFilter);
      }
      reaction(() => appStore.mapFilter, setMapFilter);
    }
  }, [layerViews]);

  useEffect(() => {
    if (layers) {
      reaction(
        () => appStore.visualizationType,
        (visualizationType) => {
          setVisualization(visualizationType, layers);
        }
      );
    }
  }, [layers]);

  useEffect(() => {
    if (view) {
      view.goTo({ zoom: 3 }, { speedFactor: 0.1 });
      if (appStore.mapPadding) {
        setMapPadding(appStore.mapPadding);
      }
      reaction(() => appStore.mapPadding, setMapPadding);
    }
  }, [view]);

  function setMapPadding(mapPadding) {
    view.padding = {
      top: mapPadding[0],
      right: mapPadding[1],
      bottom: mapPadding[2],
      left: mapPadding[3]
    };
  }

  function setMapFilter(mapFilter) {
    let filterExpression = mapFilter ? mapFilter : null;
    layerViews.forEach((lyrView) => (lyrView.filter = { where: filterExpression }));
  }

  function setVisualization(visualizationType, layers) {
    switch (visualizationType) {
      case 'usage':
        layers[0].visible = false;
        layers[0].renderer = getUsageLineRenderer();
        layers[1].renderer = getUsagePointRenderer();
        layers[1].visible = true;
        layers[1].labelingInfo = null;
        break;
      case 'general':
        layers[1].visible = false;
        layers[0].renderer = getGeneralLineRenderer();
        layers[1].renderer = getGeneralPointRenderer();
        layers[0].visible = true;
        layers[1].labelingInfo = null;
        break;
      case 'usage-constellation':
        layers[1].renderer = getUsageConstellationsPointRenderer();
        layers[0].renderer = getUsageConstellationsLineRenderer();
        layers[0].visible = true;
        layers[1].visible = false;
        layers[1].labelingInfo = getUsageLabelingInfo();
        break;
    }
  }

  return (
    <>
      <div className={styles.mapDiv} ref={mapDiv}></div> <Outlet />
    </>
  );
});
