import satellites from '../services/satellites';
import { makeAutoObservable, observable } from 'mobx';
import { group } from 'd3-array';
import { purposeCategories, orbitTypes } from '../config';
import { clamp, updateHashParam } from '../utils/utils';
import mapStore from './MapStore';

class AppStore {
  data = satellites;
  isLoading = true;
  activeState = null;
  mapPadding = [0, 0, 0, 0];
  searchString = null;
  selectedSatellite = null;
  inSearch = false;

  constructor() {
    makeAutoObservable(this, {
      data: observable.ref,
      selectedSatellite: observable.ref
    });
    mapStore.initializeMap(this.data);
    window.addEventListener('resize', this.setMapPadding.bind(this));
  }

  setIsLoading(value) {
    this.isLoading = value;
  }

  setActiveState(value) {
    this.activeState = value;
    this.setMapPadding();

    if (value === 'general' || value === 'about') {
      mapStore.setVisualizationType('general');
      mapStore.setMapFilter(null);
    }

    if (value === 'orbits') {
      mapStore.setVisualizationType('orbits');
      mapStore.drawOrbitRanges(true);
      mapStore.setMapFilter('1=2');
    } else {
      mapStore.drawOrbitRanges(false);
    }

    if (value === 'search') {
      mapStore.setVisualizationType('search');
      this.setInSearch(true);
    }
    if (value === 'satellite') {
      mapStore.setVisualizationType('satellite');
    }
    if (value === 'usage') {
      mapStore.setVisualizationType('usage');
    }

    if (value === 'owners') {
      mapStore.setVisualizationType('owners');
    }
  }

  setInSearch(value) {
    this.inSearch = value;
  }

  setSelectedSatellite(sat) {
    this.selectedSatellite = sat;
    mapStore.setSelectedSatellite(sat);
    if (sat) {
      updateHashParam({ key: 'norad', value: sat.norad });
    } else {
      updateHashParam({ key: 'norad', value: null });
    }
  }

  getCountsByPurpose() {
    if (this.data) {
      const meta = this.data.map((d) => d.metadata);
      const countsByPurpose = {};
      countsByPurpose.total = meta.slice().length;
      const purposeMap = group(meta, (d) => d.purpose);
      for (let key in purposeCategories) {
        const categories = purposeCategories[key];
        categories.forEach((category) => {
          if (countsByPurpose.hasOwnProperty(key)) {
            countsByPurpose[key] += purposeMap.get(category).length;
          } else {
            countsByPurpose[key] = purposeMap.get(category).length;
          }
        });
      }
      return countsByPurpose;
    }
  }

  getCountsByOrbit() {
    if (this.data) {
      const meta = this.data.map((d) => d.metadata);
      const countsByOrbit = {};
      countsByOrbit.total = meta.slice().length;
      const orbitsMap = group(meta, (d) => d.orbit_class);
      for (let key in orbitTypes) {
        const type = orbitTypes[key];
        if (countsByOrbit.hasOwnProperty(key)) {
          countsByOrbit[key] += orbitsMap.get(type).length;
        } else {
          countsByOrbit[key] = orbitsMap.get(type).length;
        }
      }
      return countsByOrbit;
    }
  }

  getCountsByCountry() {
    if (this.data) {
      const meta = this.data.map((d) => d.metadata);
      const countsByCountry = {
        total: meta.slice().length
      };
      const countriesMap = Array.from(
        group(meta, (d) => d.country_operator),
        ([key, value]) => ({ key, value: value.length })
      );
      countsByCountry.list = countriesMap.slice().sort((a, b) => {
        return b.value - a.value;
      });
      return countsByCountry;
    }
  }

  getCountsByOperator() {
    if (this.data) {
      const meta = this.data.map((d) => d.metadata);
      const countsByOperator = {
        total: meta.slice().length
      };
      const operatorsMap = Array.from(
        group(meta, (d) => d.operator),
        ([key, value]) => ({ key, value: value.length })
      );
      countsByOperator.list = operatorsMap.slice().sort((a, b) => {
        return b.value - a.value;
      });
      return countsByOperator;
    }
  }

  setMapPadding() {
    if (this.activeState === 'general' || this.activeState === 'about') {
      this.mapPadding = [0, 0, 0, 0];
    } else {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 550) {
        this.mapPadding = [0, 0, clamp(250, 30, 400, height), 0];
      } else {
        this.mapPadding = [0, clamp(350, 40, 600, width), 0, 0];
      }
    }
    mapStore.setMapPadding(this.mapPadding);
  }

  setSearchString(searchString) {
    this.searchString = searchString;
    if (searchString) {
      mapStore.setMapFilter(
        `LOWER(name) LIKE '%${searchString}%' OR LOWER(official_name) LIKE '%${searchString}%' OR LOWER(operator) LIKE '%${searchString}%'`
      );
    } else {
      mapStore.setMapFilter(null);
    }
  }

  getSatelliteById(id) {
    if (appStore.data) {
      return appStore.data.filter((satellite) => satellite.norad === parseInt(id))[0];
    }
    return null;
  }
}

const appStore = new AppStore();

export default appStore;
