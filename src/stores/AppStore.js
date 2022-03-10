import DataStore from './DataStore';
import { makeAutoObservable } from 'mobx';
import { group } from 'd3-array';
import { purposeCategories, orbitTypes } from '../config';
import { clamp, updateHashParam } from '../utils/utils';
class AppStore {
  data = null;
  viewIsReady = false;
  activeState = null;
  location = null;
  mapFilter = null;
  visualizationType = null;
  orbitalRangesVisible = false;
  mapPadding = [0, 0, 0, 0];
  searchString = null;
  selectedSatellite = null;
  inSearch = false;

  constructor(dataStore) {
    makeAutoObservable(this);
    (async () => {
      const data = await dataStore.fetchData();
      this.setData(data);
      window.addEventListener('resize', this.setMapPadding.bind(this));
    })();
  }

  setData(data) {
    this.data = data;
  }

  setViewReady(value) {
    this.viewIsReady = value;
  }

  setActiveState(value) {
    this.activeState = value;
    this.setMapPadding();

    if (value === 'general') {
      this.setVisualizationType('general');
      this.setMapFilter(null);
    }

    if (value === 'orbits') {
      this.setVisualizationType('orbits');
      this.setOrbitalRangesVisible(true);
      this.setMapFilter('1=2');
    } else {
      this.setOrbitalRangesVisible(false);
    }

    if (value === 'search') {
      this.setVisualizationType('search');
      this.setInSearch(true);
    }
    if (value === 'satellite') {
      this.setVisualizationType('satellite');
    }
  }

  setInSearch(value) {
    this.inSearch = value;
  }

  setSelectedSatellite(sat) {
    this.selectedSatellite = sat;
    if (sat) {
      this.setMapFilter(`norad = ${sat.norad}`);
      updateHashParam({ key: 'norad', value: sat.norad });
    } else {
      updateHashParam({ key: 'norad', value: null });
    }
  }

  setOrbitalRangesVisible(value) {
    this.orbitalRangesVisible = value;
  }

  setMapFilter(filter) {
    this.mapFilter = filter;
  }

  setVisualizationType(type) {
    this.visualizationType = type;
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

  setMapPadding() {
    if (this.activeState === 'general') {
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
  }

  setSearchString(searchString) {
    this.searchString = searchString;
    if (searchString) {
      this.setMapFilter(
        `LOWER(name) LIKE '%${searchString}%' OR LOWER(official_name) LIKE '%${searchString}%' OR LOWER(operator) LIKE '%${searchString}%'`
      );
    } else {
      this.setMapFilter(null);
    }
  }

  getSatelliteById(id) {
    if (appStore.data) {
      return appStore.data.filter((satellite) => satellite.norad === parseInt(id))[0];
    }
    return null;
  }
}

const dataStore = new DataStore();
const appStore = new AppStore(dataStore);

export default appStore;
