import WebScene from '@arcgis/core/WebScene';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { fields } from '../config';
import { getOrbit, getSatelliteLocation } from '../utils/utils';

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
      const coordinate = getSatelliteLocation(satrec, NOW, NOW);
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
    const layerFields = [
      { name: 'index', type: 'oid' },
      ...fields.map((field) => {
        return { name: field.name, type: field.type };
      })
    ];
    map.addMany([
      new FeatureLayer({
        id: 'satellite',
        fields: layerFields,
        geometryType: 'point',
        source: satelliteGraphics,
        objectIdField,
        spatialReference: {
          wkid: 4326
        },
        labelsVisible: true,
        screenSizePerspectiveEnabled: false
      }),
      new FeatureLayer({
        id: 'orbit',
        fields: layerFields,
        geometryType: 'polyline',
        objectIdField,
        source: orbitGraphics,
        spatialReference: {
          wkid: 4326
        }
      })
    ]);
    return map;
  }
}

export default MapStore;
