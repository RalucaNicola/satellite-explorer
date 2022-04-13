import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { apogeeBlue, perigeeYellow } from '../config';
import { action, makeObservable, observable } from 'mobx';
import { getSatellitePointSymbol, getStippledLineSymbol, getLineSymbol } from '../utils/visualizationUtils';

import { getSatelliteLocation, getOrbit } from '../utils/satPositionUtils';

import { updateHashParam } from '../utils/urlUtils';
class SatelliteStore {
  selectedSatellite = null;
  view = null;
  currentTime = null;
  startTime = null;
  timeInterval = null;
  satellitePosition = null;
  apogeePosition = null;
  perigeePosition = null;
  followSatellite = true;

  constructor() {
    makeObservable(this, {
      currentTime: observable.ref,
      setCurrentTime: action,
      selectedSatellite: observable.ref,
      setSelectedSatellite: action
    });
  }

  setView(view) {
    this.view = view;
    if (this.selectedSatellite) {
      this.setSelectedSatellite(this.selectedSatellite);
    }
  }

  setSelectedSatellite(sat) {
    this.selectedSatellite = sat;
    if (this.view) {
      if (sat) {
        this.renderSatellite(sat);
        updateHashParam({ key: 'norad', value: sat.norad });
      } else {
        clearInterval(this.timeInterval);
        this.view.graphics.removeAll();
        updateHashParam({ key: 'norad', value: null });
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
          this.view
            .goTo(satelliteGraphics[0])
            .then(() => {
              this.setTimeInterval(satellite, satelliteGraphics);
            })
            .catch(() => {
              this.setTimeInterval(satellite, satelliteGraphics);
            });
        }
      },
      () => {
        this.view.graphics.removeAll();
      }
    );
  }

  setTimeInterval(satellite, satelliteGraphics) {
    if (this.followSatellite && satellite.featuredSatellite) {
      this.followCamera({ animate: true });
    }
    this.timeInterval = window.setInterval(() => {
      this.updateSatellitePosition(satellite, satelliteGraphics);
      if (this.followSatellite && satellite.featuredSatellite) {
        this.followCamera({ animate: false });
      }
    }, 500);
  }

  getHeading() {
    const oldPosition = new Point(
      getSatelliteLocation(this.selectedSatellite.satrec, new Date(this.currentTime.getTime() - 1000), this.startTime)
    );
    const newPosition = new Point(this.satellitePosition);
    const dx = newPosition.x - oldPosition.x;
    const dy = newPosition.y - oldPosition.y;
    const angle = Math.atan2(dy, dx);
    const heading = (-angle / Math.PI) * 180 - 90;
    return heading;
  }

  followCamera({ animate }) {
    const cameraPosition = getSatelliteLocation(
      this.selectedSatellite.satrec,
      new Date(this.currentTime.getTime() - 70000),
      this.startTime
    );
    cameraPosition.z += 500000;
    this.view.goTo(
      { position: new Point(cameraPosition), center: new Point(this.satellitePosition) },
      { duration: 500, animate }
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
              height: 100000,
              heading: this.getHeading()
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
    const heading = this.getHeading();
    const symbol = satelliteGraphics[0].symbol.clone();
    symbol.symbolLayers.getItemAt(0).heading = heading;
    satelliteGraphics[0].symbol = symbol;
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
