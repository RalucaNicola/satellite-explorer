import * as styles from './Map.module.css';
import { useEffect, useRef } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import WebScene from '@arcgis/core/WebScene';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { Point, Polyline } from '@arcgis/core/geometry';
import { useData } from '../DataProvider';
import { propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';

const NOW = new Date();
let view = null;

export function Map() {
  const mapDiv = useRef(null);
  const data = useData();

  useEffect(() => {
    if (mapDiv.current) {
      const webscene = new WebScene({
        portalItem: {
          id: '5f37df175f424207a4689220675c741a'
        }
      });

      view = new SceneView({
        container: mapDiv.current,
        map: webscene,
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
    }
  }, []);

  useEffect(() => {
    console.log('View is', view);
    console.log('Data is', data);

    const satelliteGraphics = data.map((sat, index) => {
      const { norad, satrec, metadata } = sat;
      const coordinate = getSatelliteLocation(satrec, NOW);
      if (!coordinate) {
        console.log(norad);
      }
      const geometry = new Point(coordinate);

      const attributes = {
        index,
        ...metadata
      };

      return new Graphic({
        attributes,
        geometry
      });
    });

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
    view.map.addMany([
      new FeatureLayer({
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
      }),
      new FeatureLayer({
        id: 'orbit',
        fields: [
          { name: 'index', type: 'oid' },
          { name: 'name', type: 'string' },
          { name: 'operator', type: 'string' }
        ],
        popupTemplate: { title: '{name} - {operator}' },
        geometryType: 'polyline',
        objectIdField,
        source: orbitGraphics,
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
      })
    ]);
  }, [data]);
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
