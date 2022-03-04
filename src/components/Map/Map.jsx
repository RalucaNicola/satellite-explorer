import * as styles from './Map.module.css';
import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { whenFalseOnce } from '@arcgis/core/core/watchUtils';
import appStore from '../../stores/AppStore';
import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';

import { apogeeBlue, perigeeYellow } from '../../config';

import {
  getGeneralLineRenderer,
  getGeneralPointRenderer,
  getUsageLineRenderer,
  getUsagePointRenderer,
  getUsageLabelingInfo,
  getPointSymbol,
  getLineSymbol,
  getStippledLineSymbol,
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
      const orbitCoordinates = getOrbit(satellite.satrec, satellite.metadata.period, NOW, 200);
      const orbitGraphic = new Graphic({
        symbol: getStippledLineSymbol([255, 255, 255, 1], 1.5),
        geometry: new Polyline({
          paths: [orbitCoordinates.map((coordinate) => [coordinate.x, coordinate.y, coordinate.z])]
        })
      });
      const orbitCoordinatesByHeight = [...orbitCoordinates];
      orbitCoordinatesByHeight.sort((coord1, coord2) => {
        return coord1.z - coord2.z;
      });

      const apogeePosition = orbitCoordinatesByHeight[orbitCoordinatesByHeight.length - 1];
      const apogeeGraphic = new Graphic({
        symbol: getPointSymbol({
          color: apogeeBlue,
          size: 10,
          outlineSize: 2,
          outlineOpacity: 0.6,
          outlineColor: apogeeBlue
        }),
        geometry: new Point(apogeePosition)
      });
      const apogeeHelperGraphic = new Graphic({
        symbol: getStippledLineSymbol(apogeeBlue, 1.5),
        geometry: new Polyline({
          paths: [
            [apogeePosition.x, apogeePosition.y, apogeePosition.z],
            [apogeePosition.x, apogeePosition.y, 0]
          ]
        })
      });
      const perigeePosition = orbitCoordinatesByHeight[0];
      const perigeeGraphic = new Graphic({
        symbol: getPointSymbol({
          color: perigeeYellow,
          size: 10,
          outlineSize: 2,
          outlineOpacity: 0.6,
          outlineColor: perigeeYellow
        }),
        geometry: new Point(perigeePosition)
      });
      const perigeeHelperGraphic = new Graphic({
        symbol: getStippledLineSymbol(perigeeYellow, 1.5),
        geometry: new Polyline({
          paths: [
            [perigeePosition.x, perigeePosition.y, perigeePosition.z],
            [perigeePosition.x, perigeePosition.y, 0]
          ]
        })
      });

      view.graphics.addMany([orbitGraphic, apogeeGraphic, apogeeHelperGraphic, perigeeGraphic, perigeeHelperGraphic]);
      let symbol = null;
      const position = getSatelliteLocation(satellite.satrec, NOW, NOW);
      if (featuredSatellite && featuredSatellite.model) {
        symbol = {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'object',
              resource: { href: featuredSatellite.model },
              material: { color: [255, 255, 255] },
              height: 100000
            }
          ]
        };
        const satelliteGraphic = new Graphic({
          symbol,
          geometry: new Point(position)
        });
        view.graphics.add(satelliteGraphic);
        view.goTo(satelliteGraphic);
      } else {
        symbol = getPointSymbol({
          color: [156, 255, 242],
          size: 10,
          outlineSize: 2,
          outlineOpacity: 0.6,
          outlineColor: [156, 255, 242]
        });
        const satelliteGraphic = new Graphic({
          symbol,
          geometry: new Point(position)
        });

        view.goTo(orbitGraphic);
        animateSatelliteLine(orbitCoordinates).then(() => {
          view.graphics.add(satelliteGraphic);
        });
      }
    } else {
      view.graphics.removeAll();
    }
  }

  const animateSatelliteLine = (coords) => {
    return new Promise((resolve, reject) => {
      const addLineSegment = (i) => {
        if (i >= 0) {
          let polyline = new Polyline({
            paths: [
              [coords[i].x, coords[i].y, coords[i].z],
              [coords[i + 1].x, coords[i + 1].y, coords[i + 1].z]
            ]
          });
          const opacity = Math.min(1 - i / coords.length, 0.8);
          const lineSymbol = {
            type: 'simple-line',
            color: [156, 255, 242, opacity],
            width: 10,
            cap: 'butt'
          };

          const lineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol
          });

          view.graphics.add(lineGraphic);
          window.requestAnimationFrame(() => {
            addLineSegment(i - 1);
          });
        } else {
          resolve();
        }
      };
      addLineSegment(coords.length - 2);
    });
  };

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
