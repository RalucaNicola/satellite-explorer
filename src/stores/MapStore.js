import WebScene from '@arcgis/core/WebScene';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { whenFalseOnce } from '@arcgis/core/core/watchUtils';
import { orbitOrange, orbitYellow, orbitGreen } from '../config';
import { action, makeObservable, observable } from 'mobx';
import {
  getGeneralLineRenderer,
  getUsageLineRenderer,
  getCountryLineRenderer,
  fadeIn,
  getOrbitRangeGraphic,
  fadeInSymbol,
  fadeOutSymbol
} from '../utils/visualizationUtils';

import { initialCamera, leoCamera } from '../config';

import satelliteStore from './SatelliteStore';

const generalLineRenderer = getGeneralLineRenderer();
const usageLineRenderer = getUsageLineRenderer();
const orbitLineRenderer = getGeneralLineRenderer(0.3);
const countriesLineRenderer = getCountryLineRenderer();

class MapStore {
  map = null;
  view = null;
  orbitsLayer = null;
  orbitsLV = null;
  visualizationType = null;
  mapFilter = null;
  mapPadding = null;
  debrisLayer = null;
  debrisLV = null;

  constructor() {
    makeObservable(this, {
      map: observable.ref,
      setMap: action
    });
    this.initializeMap();
  }

  initializeMap() {
    const map = new WebScene({
      portalItem: {
        id: '53411b46fdbe4161b356030eae9905e0'
      }
    });
    this.orbitRangesLayer = new GraphicsLayer({
      title: 'orbitRanges'
    });
    map.addMany([this.orbitRangesLayer]);
    map.loadAll().then(() => {
      map.allLayers.forEach((layer) => {
        if (layer.title === 'orbits') {
          this.orbitsLayer = layer;
        }
        if (layer.title === 'debris') {
          this.debrisLayer = layer;
          this.debrisLayer.screenSizePerspectiveEnabled = false;
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
    if (this.mapPadding) {
      this.updateMapPadding(this.mapPadding);
    }
    whenFalseOnce(view, 'updating', () => {
      if (!satelliteStore.selectedSatellite) {
        this.goToPosition('home');
      }
      this.setLayerViews();
    });
  }

  setLayerViews() {
    (async () => {
      this.orbitsLV = await this.view.whenLayerView(this.orbitsLayer);
      this.debrisLV = await this.view.whenLayerView(this.debrisLayer);
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
    if (this.orbitsLayer) {
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
        break;
      case 'usage':
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = usageLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'general':
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = generalLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'satellite':
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = false;
        break;
      case 'orbits':
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = orbitLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'owners':
        this.debrisLayer.visible = false;
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = countriesLineRenderer;
        fadeIn(this.orbitsLayer);
        break;
      case 'debris':
        this.orbitsLayer.visible = false;
        this.debrisLayer.visible = true;
    }
  }

  setMapFilter(mapFilter, effect = true) {
    this.mapFilter = mapFilter;
    this.filterOrbits(mapFilter, effect);
    this.clearPopup();
  }

  filterOrbits(filterExpression, effect) {
    if (this.orbitsLV) {
      this.orbitsLV.filter = { where: filterExpression };
      if (effect && this.orbitsLV.layer.opacity === 1) {
        fadeIn(this.orbitsLV.layer);
      }
    }
  }

  drawOrbitRanges(rangesVisible) {
    if (this.orbitRangesLayer) {
      if (rangesVisible) {
        this.leoOrbit = getOrbitRangeGraphic(160000, 2000000, orbitOrange);
        this.meoOrbit = getOrbitRangeGraphic(2000000, 34000000, orbitYellow);
        this.geoOrbit = getOrbitRangeGraphic(35000000, 35500000, orbitGreen);
        this.orbitRangesLayer.addMany([this.leoOrbit, this.meoOrbit, this.geoOrbit]);
      } else {
        this.orbitRangesLayer.removeAll();
      }
    }
  }

  clearPopup() {
    if (this.view) {
      this.view.popup.clear();
      this.view.popup.close();
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
