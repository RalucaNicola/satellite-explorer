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
      setCurrentTime: action
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
      this.orbitsLayer = map.allLayers.find((layer) => layer.title === 'orbits');
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

  styleLayers(type) {
    switch (type) {
      case 'search':
        this.orbitsLayer.visible = false;
        this.satellitesLayer.visible = true;
        fadeIn(this.satellitesLayer);
        break;
      case 'usage':
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = usageLineRenderer;
        this.satellitesLayer.visible = false;
        fadeIn(this.orbitsLayer);
        break;
      case 'general':
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = generalLineRenderer;
        this.satellitesLayer.visible = false;
        fadeIn(this.orbitsLayer);
        break;
      case 'satellite':
        this.satellitesLayer.visible = false;
        this.orbitsLayer.visible = false;
        break;
      case 'orbits':
        this.orbitsLayer.visible = true;
        this.orbitsLayer.renderer = orbitLineRenderer;
        this.satellitesLayer.visible = false;
        fadeIn(this.orbitsLayer);
        break;
      case 'owners':
        this.orbitsLayer.visible = true;
        this.satellitesLayer.visible = false;
        this.orbitsLayer.renderer = countriesLineRenderer;
        fadeIn(this.orbitsLayer);
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
          const location = getSatelliteLocation(satellite.satrec, new Date());
          const satelliteGraphics = this.getSatelliteGraphics({
            featuredSatellite: satellite.featuredSatellite,
            color: [156, 255, 242],
            location
          });
          this.view.graphics.addMany(satelliteGraphics);
          this.view.goTo(satelliteGraphics);
          this.timeInterval = window.setInterval(() => {
            this.updateSatellitePosition(satellite, satelliteGraphics);
          }, 2000);
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
            },
            {
              type: 'icon',
              resource: { primitive: 'circle' },
              material: { color: [...color, 1] },
              size: 10
            },
            {
              type: 'icon',
              resource: { primitive: 'circle' },
              material: { color: [0, 0, 0, 0] },
              outline: { color: [...color, 0.6], size: 2 },
              size: 20
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
    const location = getSatelliteLocation(satellite.satrec, this.currentTime);
    satelliteGraphics[0].geometry = new Point(location);
    satelliteGraphics[1].geometry = new Polyline({
      paths: [
        [location.x, location.y, location.z],
        [location.x, location.y, 0]
      ]
    });
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

    const apogeePosition = orbitCoordinatesByHeight[orbitCoordinatesByHeight.length - 1];
    const apogeeGraphics = this.getSatelliteGraphics({
      color: apogeeBlue,
      location: apogeePosition
    });
    this.view.graphics.addMany(apogeeGraphics);

    const perigeePosition = orbitCoordinatesByHeight[0];
    const perigeeGraphics = this.getSatelliteGraphics({
      color: perigeeYellow,
      location: perigeePosition
    });
    this.view.graphics.addMany(perigeeGraphics);
  }

  // renderSatellite(satellite) {
  //   if (satellite) {
  //     const NOW = new Date();
  //     const orbitCoordinates = getOrbit(satellite.satrec, satellite.metadata.period, NOW, 200);
  //     const orbitGraphic = new Graphic({
  //       symbol: getStippledLineSymbol([255, 255, 255, 1], 1.5),
  //       geometry: new Polyline({
  //         paths: [orbitCoordinates.map((coordinate) => [coordinate.x, coordinate.y, coordinate.z])]
  //       })
  //     });

  //     let symbol = null;
  //     const position = getSatelliteLocation(satellite.satrec, NOW, NOW);
  //     if (satellite.featuredSatellite) {
  //       symbol = {
  //         type: 'point-3d',
  //         symbolLayers: [
  //           {
  //             type: 'object',
  //             resource: { href: satellite.featuredSatellite.model },
  //             material: { color: [255, 255, 255] },
  //             height: 100000
  //           }
  //         ]
  //       };
  //       const satelliteGraphic = new Graphic({
  //         symbol,
  //         geometry: new Point(position)
  //       });
  //       this.view.graphics.add(satelliteGraphic);
  //       this.view.goTo(satelliteGraphic);
  //     } else {
  //       symbol = getPointSymbol({
  //         color: [156, 255, 242],
  //         size: 10,
  //         outlineSize: 2,
  //         outlineOpacity: 0.6,
  //         outlineColor: [156, 255, 242]
  //       });
  //       const satelliteGraphic = new Graphic({
  //         symbol,
  //         geometry: new Point(position)
  //       });

  //       this.view.goTo(orbitGraphic);
  //       this.animateSatelliteLine(orbitCoordinates).then(() => {
  //         this.view.graphics.add(satelliteGraphic);
  //       });
  //     }
  //   } else {
  //     this.view.graphics.removeAll();
  //   }
  // }
}

const mapStore = new MapStore();
export default mapStore;
