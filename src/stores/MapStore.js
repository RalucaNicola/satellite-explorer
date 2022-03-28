import WebScene from '@arcgis/core/WebScene';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import {
  fields,
  orbitOrange,
  orbitYellow,
  orbitGreen,
  apogeeBlue,
  perigeeYellow,
  debrisLabelingConfig
} from '../config';
import { action, makeObservable, observable } from 'mobx';
import {
  getGeneralLineRenderer,
  getGeneralPointRenderer,
  getUsageLineRenderer,
  getCountryLineRenderer,
  getSatelliteLocation,
  fadeIn,
  getOrbitRangeGraphic,
  getSatellitePointSymbol,
  getStippledLineSymbol,
  getLineSymbol,
  getOrbit
} from '../utils/utils';

const generalPointRenderer = getGeneralPointRenderer();
const generalLineRenderer = getGeneralLineRenderer();
const usageLineRenderer = getUsageLineRenderer();
const orbitLineRenderer = getGeneralLineRenderer();
const countriesLineRenderer = getCountryLineRenderer();

const initialCamera = {
  position: {
    x: 0,
    y: 20,
    z: 2e8
  },
  heading: 0,
  tilt: 0
};

class MapStore {
  map = null;
  view = null;
  satellitesLayer = null;
  orbitsLayer = null;
  layerViews = null;
  visualizationType = null;
  mapFilter = null;
  selectedSatellite = null;
  mapPadding = null;
  positionTime = null;
  timeInterval = null;
  currentTime = null;
  apogeePosition = null;
  perigeePosition = null;
  satellitePosition = null;
  debrisLayer = null;
  debrisLV = null;

  constructor() {
    makeObservable(this, {
      map: observable.ref,
      setMap: action,
      view: false,
      satellitesLayer: false,
      orbitsLayer: false,
      layerViews: false,
      visualizationType: false,
      mapFilter: false,
      selectedSatellite: false,
      mapPadding: false,
      positionTime: observable.ref,
      setPositionTime: action,
      timeInterval: false,
      currentTime: observable.ref,
      setCurrentTime: action,
      apogeePosition: false,
      perigeePosition: false,
      satellitePosition: false,
      debrisLayer: false,
      debrisLV: false
    });
  }

  getSatellitesLayer(data) {
    const NOW = new Date();
    this.setPositionTime(NOW);
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
    const objectIdField = 'index';
    const layerFields = [
      { name: 'index', type: 'oid' },
      ...fields.map((field) => {
        return { name: field.name, type: field.type };
      })
    ];
    return new FeatureLayer({
      id: 'satellite',
      fields: layerFields,
      geometryType: 'point',
      source: satelliteGraphics,
      objectIdField,
      spatialReference: {
        wkid: 4326
      },
      labelsVisible: false,
      screenSizePerspectiveEnabled: true,
      renderer: generalPointRenderer,
      visible: false
    });
  }

  updateCurrentSatellites(data) {
    const NOW = new Date();
    this.setPositionTime(NOW);
    const updateFeatures = [];
    for (let index = 0; index < data.length; index++) {
      const sat = data[index];
      const { satrec } = sat;
      const coordinate = getSatelliteLocation(satrec, NOW);
      if (!coordinate) {
        continue;
      }
      const geometry = new Point(coordinate);
      updateFeatures.push({
        attributes: { index },
        geometry
      });
    }
    this.satellitesLayer.applyEdits({ updateFeatures }).catch(console.error);
  }

  setPositionTime(value) {
    this.positionTime = value;
  }

  initializeMap(data) {
    const map = new WebScene({
      portalItem: {
        id: '53411b46fdbe4161b356030eae9905e0'
      }
    });
    this.satellitesLayer = this.getSatellitesLayer(data);
    map.add(this.satellitesLayer);
    map.loadAll().then(() => {
      map.allLayers.forEach((layer) => {
        if (layer.title === 'orbits') {
          this.orbitsLayer = layer;
        }
        if (layer.title === 'debris') {
          this.debrisLayer = layer;
          this.debrisLayer.screenSizePerspectiveEnabled = false;
          this.debrisLayer.labelingInfo = debrisLabelingConfig.map((deb) => {
            return new LabelClass({
              where: `name = '${deb.name}'`,
              labelExpressionInfo: { expression: '$feature.name' },
              labelPlacement: 'center-right',
              symbol: {
                type: 'label-3d',
                symbolLayers: [
                  {
                    type: 'text',
                    material: {
                      color: [255, 255, 255]
                    },
                    background: {
                      color: deb.color
                    },
                    font: {
                      size: 11,
                      family: 'sans-serif'
                    }
                  }
                ]
              }
            });
          });
          this.debrisLayer.labelsVisible = true;
        }
      });
      this.setMap(map);
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

  setCurrentTime() {
    this.currentTime = new Date();
  }

  setLayerViews(view) {
    (async () => {
      const orbitLV = await view.whenLayerView(this.orbitsLayer);
      const satelliteLV = await view.whenLayerView(this.satellitesLayer);
      this.debrisLV = await view.whenLayerView(this.debrisLayer);
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
    if (this.orbitsLayer && this.satellitesLayer) {
      this.styleLayers(type);
    }
  }

  filterSpaceDebris(filterType) {
    if (this.debrisLV) {
      switch (filterType) {
        case 'cosmos':
          this.debrisLV.filter = {
            where: `name IN ('COSMOS 2251 DEB', 'COSMOS 2251', 'IRIDIUM 33 DEB', 'IRIDIUM 33')`
          };
          break;
        case 'chinese-antitest':
          this.debrisLV.filter = { where: `name='FENGYUN 1C' OR name='FENGYUN 1C DEB'` };
          break;
        case 'russian-antitest':
          this.debrisLV.filter = { where: `name='COSMOS 1408' OR name='COSMOS 1408 DEB'` };
          break;
        default:
          this.debrisLV.filter = { where: '1=1' };
          break;
      }
    }
  }

  styleLayers(type) {
    switch (type) {
      case 'search':
        this.orbitsLayer.visible = false;
        this.debrisLayer.visible = false;
        this.satellitesLayer.visible = true;
        fadeIn(this.satellitesLayer);
        break;
      case 'usage':
        this.satellitesLayer.visible = false;
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = usageLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'general':
        this.satellitesLayer.visible = false;
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = generalLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'satellite':
        this.debrisLayer.visible = false;
        this.satellitesLayer.visible = false;
        this.orbitsLayer.visible = false;
        break;
      case 'orbits':
        this.debrisLayer.visible = false;
        this.satellitesLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = orbitLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'owners':
        this.satellitesLayer.visible = false;
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = countriesLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'debris':
        this.satellitesLayer.visible = false;
        this.orbitsLayer.visible = false;
        this.debrisLayer.visible = true;
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
      if (sat) {
        this.renderSatellite(sat);
      } else {
        clearInterval(this.timeInterval);
        this.view.graphics.removeAll();
      }
    }
  }

  renderSatellite(satellite) {
    this.setCurrentTime();
    const orbitCoordinates = getOrbit(satellite.satrec, satellite.metadata.period, this.currentTime, 150);
    this.animateSatelliteOrbit(orbitCoordinates).then(
      () => {
        if (this.selectedSatellite) {
          this.setApogeeAndPerigee(orbitCoordinates);
          this.satellitePosition = getSatelliteLocation(satellite.satrec, this.currentTime);
          const satelliteGraphics = this.getSatelliteGraphics({
            featuredSatellite: satellite.featuredSatellite,
            color: [156, 255, 242],
            location: this.satellitePosition
          });
          this.view.graphics.addMany(satelliteGraphics);
          this.view.goTo(satelliteGraphics);
          // this.timeInterval = window.setInterval(() => {
          //   this.updateSatellitePosition(satellite, satelliteGraphics);
          // }, 2000);
        }
      },
      () => {
        this.view.graphics.removeAll();
      }
    );
  }

  getSatelliteGraphics({ featuredSatellite, color, location }) {
    const symbol = featuredSatellite
      ? {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'object',
              resource: { href: featuredSatellite.model },
              material: { color: [255, 255, 255] },
              height: 100000
            }
          ]
        }
      : getSatellitePointSymbol({
          color: color,
          size: 10,
          outlineSize: 2,
          outlineOpacity: 0.6,
          outlineColor: color
        });
    return [
      new Graphic({
        geometry: new Point(location),
        symbol
      }),
      new Graphic({
        symbol: getLineSymbol(color, 1.5),
        geometry: new Polyline({
          paths: [
            [location.x, location.y, location.z],
            [location.x, location.y, 0]
          ]
        })
      })
    ];
  }

  updateSatellitePosition(satellite, satelliteGraphics) {
    this.setCurrentTime();
    this.satellitePosition = getSatelliteLocation(satellite.satrec, this.currentTime);
    satelliteGraphics[0].geometry = new Point(this.satellitePosition);
    satelliteGraphics[1].geometry = new Polyline({
      paths: [
        [this.satellitePosition.x, this.satellitePosition.y, this.satellitePosition.z],
        [this.satellitePosition.x, this.satellitePosition.y, 0]
      ]
    });
    this.view.goTo({ center: new Point(this.satellitePosition), tilt: 40 }, { duration: 2000 });
  }

  animateSatelliteOrbit(coords) {
    const zoomToGraphic = new Graphic({
      geometry: new Polyline({
        paths: [coords.map((coord) => [coord.x, coord.y, coord.z])]
      })
    });
    this.view.goTo(zoomToGraphic);
    const orbitGraphic = new Graphic({
      geometry: new Polyline({
        paths: [
          [coords[0].x, coords[0].y, coords[0].z],
          [coords[1].x, coords[1].y, coords[1].z]
        ]
      }),
      symbol: getStippledLineSymbol([255, 255, 255, 0.7], 1.5),
      id: 'orbitGraphic'
    });
    this.view.graphics.add(orbitGraphic);

    return new Promise((resolve, reject) => {
      const addLineSegment = (i) => {
        if (i < coords.length) {
          let polyline = new Polyline({
            paths: [...orbitGraphic.geometry.paths[0], [coords[i].x, coords[i].y, coords[i].z]]
          });
          orbitGraphic.geometry = polyline;
          if (this.selectedSatellite) {
            window.requestAnimationFrame(() => {
              addLineSegment(i + 1);
            });
          } else {
            reject();
          }
        } else {
          resolve();
        }
      };
      addLineSegment(2);
    });
  }

  setApogeeAndPerigee(orbitCoordinates) {
    const orbitCoordinatesByHeight = [...orbitCoordinates];
    orbitCoordinatesByHeight.sort((coord1, coord2) => {
      return coord1.z - coord2.z;
    });

    this.apogeePosition = orbitCoordinatesByHeight[orbitCoordinatesByHeight.length - 1];
    const apogeeGraphics = this.getSatelliteGraphics({
      color: apogeeBlue,
      location: this.apogeePosition
    });
    this.view.graphics.addMany(apogeeGraphics);

    this.perigeePosition = orbitCoordinatesByHeight[0];
    const perigeeGraphics = this.getSatelliteGraphics({
      color: perigeeYellow,
      location: this.perigeePosition
    });
    this.view.graphics.addMany(perigeeGraphics);
  }

  gotoPosition(type) {
    if (this.view) {
      switch (type) {
        case 'home':
          this.view.goTo(initialCamera, { speedFactor: 0.3 });
          break;
        case 'satellite':
          if (this.satellitePosition) {
            this.view.goTo(new Point(this.satellitePosition));
          }
          break;
        case 'apogee':
          if (this.apogeePosition) {
            this.view.goTo(new Point(this.apogeePosition));
          }
          break;
        case 'perigee':
          if (this.perigeePosition) {
            this.view.goTo(new Point(this.perigeePosition));
          }
          break;
      }
    }
  }
}

const mapStore = new MapStore();
export default mapStore;
