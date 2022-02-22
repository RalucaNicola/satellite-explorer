import * as styles from './Map.module.css';
import { useEffect, useRef, useState } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import WebScene from '@arcgis/core/WebScene';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { Point, Polyline } from '@arcgis/core/geometry';
import { useData } from '../DataProvider';
import { propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';
import { useAppState } from '../AppState';

const NOW = new Date();

export function Map() {
  const mapDiv = useRef(null);
  const [view, setView] = useState(null);
  const [lyrViewOrbit, setLyrViewOrbit] = useState(null);
  const data = useData();
  const { state } = useAppState();

  useEffect(() => {
    console.log('Effect create map');
    if (mapDiv.current) {
      const webscene = new WebScene({
        portalItem: {
          id: '5f37df175f424207a4689220675c741a'
        }
      });

      const sceneView = new SceneView({
        container: mapDiv.current,
        map: webscene,
        alphaCompositingEnabled: true,
        qualityProfile: 'high',
        // environment: {
        //   background: {
        //     type: 'color',
        //     color: [0, 0, 0, 0]
        //   },
        //   starsEnabled: false,
        //   atmosphereEnabled: false,
        //   lighting: {
        //     cameraTrackingEnabled: false,
        //     directShadowsEnabled: false
        //   }
        // },
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

      setView(sceneView);
    }
  }, []);

  useEffect(() => {
    const satelliteGraphics = [];
    for (let index = 0; index < data.length; index++) {
      const sat = data[index];
      const { satrec, metadata } = sat;
      const coordinate = getSatelliteLocation(satrec, NOW);
      if (!coordinate) {
        continue;
      }
      const geometry = new Point(coordinate);

      const attributes = {
        index,
        ...metadata
      };

      satelliteGraphics.push(
        new Graphic({
          attributes,
          geometry
        })
      );
    }

    const orbitGraphics = data.map((sat, index) => {
      const { satrec, metadata } = sat;
      const { period } = metadata;

      const coordinates = getOrbit(satrec, period, NOW);

      const attributes = {
        index,
        ...metadata
      };

      const orbit = new Graphic({
        attributes,
        geometry: new Polyline({
          paths: [coordinates.map((coordinate) => [coordinate.x, coordinate.y, coordinate.z])]
        })
      });
      return orbit;
    });

    const objectIdField = 'index';
    const satelliteFeatureLayer = new FeatureLayer({
      id: 'satellite',
      fields: [
        { name: 'index', type: 'oid' },
        { name: 'name', type: 'string' },
        { name: 'operator', type: 'string' }
      ],

      popupTemplate: { title: '{name} - {operator}' },
      geometryType: 'point',
      source: satelliteGraphics,
      objectIdField,
      spatialReference: {
        wkid: 4326
      },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'icon',
              resource: { primitive: 'circle' },
              material: { color: [255, 255, 255, 1] },
              size: 2
            },
            {
              type: 'icon',
              resource: { primitive: 'circle' },
              material: { color: [255, 255, 255, 0] },
              outline: { color: [255, 255, 255, 0.3] },
              size: 6
            }
          ]
        }
      }
    });
    const orbitFeatureLayer = new FeatureLayer({
      id: 'orbit',
      fields: [
        { name: 'index', type: 'oid' },
        { name: 'name', type: 'string' },
        { name: 'operator', type: 'string' },
        { name: 'orbit_class', type: 'string' }
      ],
      popupTemplate: { title: '{name} ---- {orbit_class}' },
      geometryType: 'polyline',
      objectIdField,
      source: orbitGraphics,
      spatialReference: {
        wkid: 4326
      },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          width: 0.25,
          color: [255, 255, 255, 0.6],
          style: 'solid',
          cap: 'round',
          join: 'round'
        }
      }
    });
    console.log('Effect data');
    if (view) {
      view.map.addMany([satelliteFeatureLayer]);
      // view.whenLayerView(orbitFeatureLayer).then((lyrView) => {
      //   setLyrViewOrbit(lyrView);
      // });
    }
  }, [data, view]);

  useEffect(() => {
    console.log('filter effect', lyrViewOrbit);
    if (lyrViewOrbit) {
      switch (state.filter) {
        case 'meo':
          lyrViewOrbit.filter = {
            where: `orbit_class = 'MEO'`
          };
          break;
        case 'leo':
          lyrViewOrbit.filter = {
            where: `orbit_class = 'LEO'`
          };
          break;
        default:
          lyrViewOrbit.filter = {
            where: `1=1'`
          };
      }
    }
  }, [state.filter, lyrViewOrbit]);
  return <div className={styles.mapDiv} ref={mapDiv}></div>;
}

function getSatelliteLocation(satrec, date) {
  const propagation = propagate(satrec, date);
  const position = propagation?.position;
  if (!position || Number.isNaN(position.x) || Number.isNaN(position.y) || Number.isNaN(position.z)) {
    return null;
  }

  const gmst = gstime(NOW);
  const geographic = eciToGeodetic(position, gmst);
  const { longitude, latitude, height } = geographic;

  const x = radiansToDegrees(longitude);
  const y = radiansToDegrees(latitude);
  const z = height * 1000;
  return { x, y, z };
}

function getOrbit(satrec, period, start) {
  const SEGMENTS = 100;
  const milliseconds = (period * 60000) / SEGMENTS;

  const vertices = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const date = new Date(start.getTime() + i * milliseconds);
    const satelliteLocation = getSatelliteLocation(satrec, date);
    if (!satelliteLocation) {
      continue;
    }
    vertices.push(satelliteLocation);
  }

  return vertices;
}
