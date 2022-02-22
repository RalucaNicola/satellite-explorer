import WebScene from '@arcgis/core/WebScene';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';

const NOW = new Date();

class MapStore {
  initializeMap(data) {
    const map = new WebScene({
      portalItem: {
        id: '5f37df175f424207a4689220675c741a'
      }
    });

    const satelliteGraphics = [];
    for (let index = 0; index < data.length; index++) {
      const sat = data[index];
      const { satrec, metadata } = sat;
      const coordinate = this.getSatelliteLocation(satrec, NOW);
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

      const coordinates = this.getOrbit(satrec, period, NOW);

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
    map.addMany([
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
      })
    ]);
    return map;
  }

  getSatelliteLocation(satrec, date) {
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

  getOrbit(satrec, period, start) {
    const SEGMENTS = 100;
    const milliseconds = (period * 60000) / SEGMENTS;

    const vertices = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const date = new Date(start.getTime() + i * milliseconds);
      const satelliteLocation = this.getSatelliteLocation(satrec, date);
      if (!satelliteLocation) {
        continue;
      }
      vertices.push(satelliteLocation);
    }

    return vertices;
  }
}

export default MapStore;
