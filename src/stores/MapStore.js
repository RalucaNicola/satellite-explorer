import WebScene from '@arcgis/core/WebScene';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { fields, orbitOrange, orbitYellow, orbitGreen, apogeeBlue, perigeeYellow } from '../config';
import { action, makeObservable, observable } from 'mobx';
import {
  getGeneralLineRenderer,
  getGeneralPointRenderer,
  getUsageLineRenderer,
  getCountryLineRenderer,
  getSatelliteLocation,
  fadeIn,
  getOrbitRangeGraphic,
  getPointSymbol,
  getStippledLineSymbol,
  getOrbit
} from '../utils/utils';

const generalPointRenderer = getGeneralPointRenderer();
const generalLineRenderer = getGeneralLineRenderer();
const usageLineRenderer = getUsageLineRenderer();
const orbitLineRenderer = getGeneralLineRenderer();
const countriesLineRenderer = getCountryLineRenderer();

class MapStore {
  map = null;
  view = null;
  layers = null;
  layerViews = null;
  visualizationType = null;
  mapFilter = null;
  selectedSatellite = null;
  mapPadding = null;

  constructor() {
    makeObservable(this, {
      map: observable.ref,
      setMap: action,
      view: false,
      layers: false,
      layerViews: false,
      visualizationType: false,
      mapFilter: false,
      selectedSatellite: false,
      mapPadding: false
    });
  }

  setCurrentSatellites(layer, data) {
    const NOW = new Date();
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

    layer.source = satelliteGraphics;
    layer.refresh();
  }

  initializeMap(data) {
    const map = new WebScene({
      portalItem: {
        id: '53411b46fdbe4161b356030eae9905e0'
      }
    });

    const objectIdField = 'index';
    const layerFields = [
      { name: 'index', type: 'oid' },
      ...fields.map((field) => {
        return { name: field.name, type: field.type };
      })
    ];
    const layer = new FeatureLayer({
      id: 'satellite',
      fields: layerFields,
      geometryType: 'point',
      objectIdField,
      spatialReference: {
        wkid: 4326
      },
      labelsVisible: false,
      screenSizePerspectiveEnabled: true,
      visible: false
    });
    this.setCurrentSatellites(layer, data);
    map.add(layer);
    map.loadAll().then(() => {
      this.setMap(map);
      const orbitLayer = map.allLayers.find((layer) => layer.title === 'orbits');
      const satelliteLayer = map.allLayers.find((layer) => layer.id === 'satellite');
      this.layers = [orbitLayer, satelliteLayer];
      this.styleLayers(this.visualizationType);
    });
  }

  setMap(map) {
    this.map = map;
  }

  setView(view) {
    this.view = view;
    this.setLayerViews(view);
    if (this.selectedSatellite) {
      this.renderSatellite(this.selectedSatellite);
    }
    if (this.mapPadding) {
      this.updateMapPadding(this.mapPadding);
    }
  }

  setLayerViews(view) {
    (async () => {
      const orbitLV = await view.whenLayerView(this.layers[0]);
      const satelliteLV = await view.whenLayerView(this.layers[1]);
      this.layerViews = [orbitLV, satelliteLV];
      this.filterLayerViews(this.mapFilter);
    })();
  }

  setMapPadding(mapPadding) {
    this.mapPadding = mapPadding;
    this.updateMapPadding(mapPadding);
  }

  updateMapPadding(mapPadding) {
    if (this.view) {
      this.view.padding = {
        top: mapPadding[0],
        right: mapPadding[1],
        bottom: mapPadding[2],
        left: mapPadding[3]
      };
    }
  }

  setVisualizationType(type) {
    this.visualizationType = type;
    if (this.layers) {
      this.styleLayers(type);
    }
  }

  styleLayers(type) {
    // layers[0] - orbits
    // layers[1] - satellites
    switch (type) {
      case 'search':
        this.layers[0].visible = false;
        this.layers[1].visible = true;
        this.layers[1].renderer = generalPointRenderer;
        fadeIn(this.layers[1]);
        break;
      case 'usage':
        this.layers[0].visible = true;
        this.layers[0].renderer = usageLineRenderer;
        this.layers[1].visible = false;
        fadeIn(this.layers[0]);
        break;
      case 'general':
        this.layers[0].visible = true;
        this.layers[0].renderer = generalLineRenderer;
        this.layers[1].visible = false;
        fadeIn(this.layers[0]);
        break;
      case 'satellite':
        this.layers[1].visible = false;
        this.layers[0].visible = false;
        break;
      case 'orbits':
        this.layers[0].visible = true;
        this.layers[0].renderer = orbitLineRenderer;
        this.layers[1].visible = false;
        fadeIn(this.layers[0]);
        break;
      case 'owners':
        this.layers[0].visible = true;
        this.layers[1].visible = false;
        this.layers[0].renderer = countriesLineRenderer;
        fadeIn(this.layers[0]);
        break;
    }
  }

  setMapFilter(mapFilter) {
    this.mapFilter = mapFilter;
    if (this.layerViews) {
      this.filterLayerViews(mapFilter);
    }
  }

  filterLayerViews(filterExpression) {
    this.layerViews.forEach((lyrView) => {
      lyrView.filter = { where: filterExpression };
      if (lyrView.layer.opacity === 1) {
        fadeIn(lyrView.layer);
      }
    });
  }

  drawOrbitRanges(rangesVisible) {
    if (this.view) {
      if (rangesVisible) {
        const leoOrbit = getOrbitRangeGraphic(160000, 2000000, orbitOrange);
        const meoOrbit = getOrbitRangeGraphic(2000000, 34000000, orbitYellow);
        const geoOrbit = getOrbitRangeGraphic(35000000, 35500000, orbitGreen);

        this.view.graphics.addMany([leoOrbit, meoOrbit, geoOrbit]);
      } else {
        this.view.graphics.removeAll();
      }
    }
  }

  setSelectedSatellite(sat) {
    this.selectedSatellite = sat;
    if (this.view) {
      this.renderSatellite(sat);
    }
  }

  renderSatellite(satellite) {
    if (satellite) {
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

      this.view.graphics.addMany([
        orbitGraphic,
        apogeeGraphic,
        apogeeHelperGraphic,
        perigeeGraphic,
        perigeeHelperGraphic
      ]);
      let symbol = null;
      const position = getSatelliteLocation(satellite.satrec, NOW, NOW);
      if (satellite.featuredSatellite) {
        symbol = {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'object',
              resource: { href: satellite.featuredSatellite.model },
              material: { color: [255, 255, 255] },
              height: 100000
            }
          ]
        };
        const satelliteGraphic = new Graphic({
          symbol,
          geometry: new Point(position)
        });
        this.view.graphics.add(satelliteGraphic);
        this.view.goTo(satelliteGraphic);
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

        this.view.goTo(orbitGraphic);
        this.animateSatelliteLine(orbitCoordinates).then(() => {
          this.view.graphics.add(satelliteGraphic);
        });
      }
    } else {
      this.view.graphics.removeAll();
    }
  }

  animateSatelliteLine(coords) {
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

          this.view.graphics.add(lineGraphic);
          window.requestAnimationFrame(() => {
            addLineSegment(i - 1);
          });
        } else {
          resolve();
        }
      };
      addLineSegment(coords.length - 2);
    });
  }
}

const mapStore = new MapStore();
export default mapStore;
