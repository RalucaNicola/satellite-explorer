import WebScene from '@arcgis/core/WebScene';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point } from '@arcgis/core/geometry';
import LabelClass from '@arcgis/core/layers/support/LabelClass';
import { fields, orbitOrange, orbitYellow, orbitGreen, debrisLabelingConfig } from '../config';
import { action, makeObservable, observable } from 'mobx';
import {
  getGeneralLineRenderer,
  getGeneralPointRenderer,
  getUsageLineRenderer,
  getCountryLineRenderer,
  fadeIn,
  getOrbitRangeGraphic,
  fadeInSymbol,
  fadeOutSymbol
} from '../utils/visualizationUtils';

import { getSatelliteLocation } from '../utils/satPositionUtils';

import { initialCamera, leoCamera } from '../config';

import satelliteStore from './SatelliteStore';
import dataStore from './DataStore';

const generalPointRenderer = getGeneralPointRenderer();
const generalLineRenderer = getGeneralLineRenderer();
const usageLineRenderer = getUsageLineRenderer();
const orbitLineRenderer = getGeneralLineRenderer(0.3);
const countriesLineRenderer = getCountryLineRenderer();

class MapStore {
  map = null;
  view = null;
  satellitesLayer = null;
  orbitsLayer = null;
  layerViews = null;
  visualizationType = null;
  mapFilter = null;
  mapPadding = null;
  currentTimeForSatellitePosition = null;
  debrisLayer = null;
  debrisLV = null;

  constructor() {
    makeObservable(this, {
      map: observable.ref,
      setMap: action,
      currentTimeForSatellitePosition: observable.ref,
      setCurrentTimeForSatellitePosition: action
    });
    this.initializeMap(dataStore.data);
  }

  getSatellitesLayer(data) {
    const NOW = new Date();
    this.setCurrentTimeForSatellitePosition(NOW);
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
      title: 'satellites',
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
    this.setCurrentTimeForSatellitePosition(NOW);
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

  setCurrentTimeForSatellitePosition(value) {
    this.currentTimeForSatellitePosition = value;
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
    satelliteStore.setView(view);
    this.goToPosition('home');
    this.setLayerViews();
    if (this.mapPadding) {
      this.updateMapPadding(this.mapPadding);
    }
  }

  setLayerViews() {
    (async () => {
      const orbitLV = await this.view.whenLayerView(this.orbitsLayer);
      const satelliteLV = await this.view.whenLayerView(this.satellitesLayer);
      this.debrisLV = await this.view.whenLayerView(this.debrisLayer);
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

  setMapFilter(mapFilter, effect = true) {
    this.mapFilter = mapFilter;
    if (this.layerViews) {
      this.filterLayerViews(mapFilter, effect);
    }
  }

  filterLayerViews(filterExpression, effect) {
    this.layerViews.forEach((lyrView) => {
      lyrView.filter = { where: filterExpression };
      if (effect && lyrView.layer.opacity === 1) {
        fadeIn(lyrView.layer);
      }
    });
  }

  drawOrbitRanges(rangesVisible) {
    if (this.view) {
      if (rangesVisible) {
        this.leoOrbit = getOrbitRangeGraphic(160000, 2000000, orbitOrange);
        this.meoOrbit = getOrbitRangeGraphic(2000000, 34000000, orbitYellow);
        this.geoOrbit = getOrbitRangeGraphic(35000000, 35500000, orbitGreen);
        this.view.graphics.addMany([this.leoOrbit, this.meoOrbit, this.geoOrbit]);
      } else {
        this.view.graphics.removeAll();
      }
    }
  }

  emphasizeOrbitRange(type) {
    switch (type) {
      case 'leo':
        fadeInSymbol(this.leoOrbit);
        fadeOutSymbol(this.meoOrbit);
        fadeInSymbol(this.geoOrbit);
        break;
      case 'meo':
        fadeOutSymbol(this.leoOrbit);
        fadeInSymbol(this.meoOrbit);
        fadeOutSymbol(this.geoOrbit);
        break;
      case 'geo':
        fadeOutSymbol(this.leoOrbit);
        fadeOutSymbol(this.meoOrbit);
        fadeInSymbol(this.geoOrbit);
        break;
      default:
        fadeOutSymbol(this.leoOrbit);
        fadeOutSymbol(this.meoOrbit);
        fadeOutSymbol(this.geoOrbit);
        break;
    }
  }

  goToPosition(position) {
    switch (position) {
      case 'home':
        this.view.goTo(initialCamera, { speedFactor: 0.25 });
        break;
      case 'search':
        this.view.goTo(initialCamera, { speedFactor: 1.2 });
        break;
      case 'debris':
        this.view.goTo(this.view.map.initialViewProperties.viewpoint);
        break;
      case 'leo':
        this.view.goTo(leoCamera, { speedFactor: 1.2 });
        break;
      default:
        this.view.goTo(initialCamera);
        break;
    }
  }
}

const mapStore = new MapStore();
export default mapStore;
