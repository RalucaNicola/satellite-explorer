import * as styles from './Map.module.css';
import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import Graphic from '@arcgis/core/Graphic';
import { Point } from '@arcgis/core/geometry';
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
  getUsageLabelingInfo,
  fadeIn,
  getOrbit,
  getSatelliteLocation
} from '../../utils/utils';

const featuredSatellites = [
  {
    id: 25544,
    model: './assets/iss/scene.gltf',
    model2: './assets/iss2/source/ISS_stationary.glb'
  }
];

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
                min: 1e4,
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

      if (appStore.selectedSatellite) {
        renderSatellite(appStore.selectedSatellite);
      }
      reaction(() => appStore.selectedSatellite, renderSatellite);
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
    layerViews.forEach((lyrView) => {
      lyrView.filter = { where: filterExpression };
      if (lyrView.layer.opacity === 1) {
        fadeIn(lyrView.layer);
      }
    });
  }

  function renderSatellite(satellite) {
    if (satellite) {
      const featuredSatellite = featuredSatellites.filter((sat) => sat.id === satellite.norad)[0];
      const NOW = new Date();
      let symbol = null;
      const position = getSatelliteLocation(satellite.satrec, NOW, NOW);
      console.log(satellite, featuredSatellite);
      if (featuredSatellite.model) {
        symbol = {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'object',
              resource: { href: featuredSatellite.model2 },
              material: { color: [255, 255, 255] },
              height: 100000
            }
          ]
        };
      } else {
        symbol = {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'icon',
              resource: { primitive: 'circle' },
              material: { color: [255, 255, 255] },
              size: 20
            }
          ]
        };
      }
      const graphic = new Graphic({
        symbol,
        geometry: new Point(position)
      });
      view.graphics.add(graphic);

      view.goTo(graphic);
    } else {
      view.graphics.removeAll();
    }
  }

  function setVisualization(visualizationType, layers) {
    switch (visualizationType) {
      case 'search':
        layers[0].opacity = 0;
        layers[1].renderer = getGeneralPointRenderer();
        layers[0].renderer = getGeneralLineRenderer();
        fadeIn(layers[1]);
        layers[0].labelingInfo = null;
        break;
      case 'usage':
        layers[1].renderer = getUsagePointRenderer();
        layers[0].opacity = 0;
        layers[0].renderer = getUsageLineRenderer();
        fadeIn(layers[1]);
        layers[1].labelingInfo = null;
        break;
      case 'usage-filtered':
        fadeIn(layers[1]);
        fadeIn(layers[0]);
        layers[1].labelingInfo = null;
        break;
      case 'general':
        layers[0].renderer = getGeneralLineRenderer();
        layers[1].renderer = getGeneralPointRenderer();
        layers[1].opacity = 0;
        layers[1].labelingInfo = null;
        fadeIn(layers[0]);
        break;
      case 'usage-constellation':
        layers[1].labelingInfo = getUsageLabelingInfo();
        fadeIn(layers[0]);
        fadeIn(layers[1]);
        break;
      case 'satellite':
        layers[1].opacity = 0;
        layers[0].opacity = 0;
    }
  }

  return (
    <>
      <div className={styles.mapDiv} ref={mapDiv}></div> <Outlet />
    </>
  );
});
