import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { apogeeBlue, perigeeYellow } from '../config';
import { action, makeObservable, observable } from 'mobx';
import {
  getSatelliteLocation,
  getSatellitePointSymbol,
  getStippledLineSymbol,
  getLineSymbol,
  getOrbit
} from '../utils/utils';

class SatelliteStore {
  selectedSatellite = null;
  view = null;
  currentTime = null;
  startTime = null;
  timeInterval = null;
  satellitePosition = null;
  apogeePosition = null;
  perigeePosition = null;

  constructor() {
    makeObservable(this, {
      currentTime: observable.ref,
      setCurrentTime: action
    });
  }

  setView(view) {
    this.view = view;
    if (this.selectedSatellite) {
      this.renderSatellite(this.selectedSatellite);
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
    this.startTime = new Date();
    const orbitCoordinates = getOrbit(satellite.satrec, satellite.metadata.period, this.startTime, 150);
    this.animateSatelliteOrbit(orbitCoordinates).then(
      () => {
        if (this.selectedSatellite) {
          this.setApogeeAndPerigee(orbitCoordinates);
          this.satellitePosition = getSatelliteLocation(satellite.satrec, this.currentTime, this.startTime);
          const satelliteGraphics = this.getSatelliteGraphics({
            featuredSatellite: satellite.featuredSatellite,
            color: [156, 255, 242],
            location: this.satellitePosition
          });
          this.view.graphics.addMany(satelliteGraphics);
          if (satellite.featuredSatellite) {
            const cameraPosition = getSatelliteLocation(satellite.satrec, new Date(this.currentTime.getTime() - 50000));
            this.view.goTo(
              { position: new Point(cameraPosition), center: new Point(this.satellitePosition), tilt: 30 },
              { duration: 1000, easing: 'linear' }
            );
          } else {
            this.view.goTo(new Point(this.satellitePosition));
          }
          this.timeInterval = window.setInterval(() => {
            this.updateSatellitePosition(satellite, satelliteGraphics);
          }, 1000);
        }
      },
      () => {
        this.view.graphics.removeAll();
      }
    );
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
    this.satellitePosition = getSatelliteLocation(satellite.satrec, this.currentTime, this.startTime);
    satelliteGraphics[0].geometry = new Point(this.satellitePosition);
    satelliteGraphics[1].geometry = new Polyline({
      paths: [
        [this.satellitePosition.x, this.satellitePosition.y, this.satellitePosition.z],
        [this.satellitePosition.x, this.satellitePosition.y, 0]
      ]
    });
  }

  setCurrentTime() {
    this.currentTime = new Date();
  }

  gotoPosition(type) {
    if (this.view) {
      switch (type) {
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

const satelliteStore = new SatelliteStore();
export default satelliteStore;
