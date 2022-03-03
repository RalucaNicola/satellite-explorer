import MapStore from './MapStore';
import DataStore from './DataStore';
import { makeAutoObservable } from 'mobx';
import { group } from 'd3-array';
import { purposeCategories } from '../config';
import { clamp } from '../utils/utils';
class AppStore {
  map = null;
  data = null;
  isLoading = true;
  viewIsReady = false;
  location = null;
  mapFilter = null;
  visualizationType = null;
  mapPadding = [0, 0, 0, 0];
  searchString = null;
  selectedSatelliteID = null;
  inSearch = false;

  constructor(dataStore, mapStore) {
    makeAutoObservable(this);
    (async () => {
      const data = await dataStore.fetchData();
      this.setData(data);
      const map = await mapStore.initializeMap(this.data);
      this.setMap(map);
      this.setIsLoading(false);
      window.addEventListener('resize', this.setMapPadding.bind(this));
    })();
  }

  setIsLoading(value) {
    this.isLoading = value;
  }
  setViewReady(value) {
    this.viewIsReady = value;
  }
  setMap(map) {
    this.map = map;
  }
  setData(data) {
    this.data = data;
  }
  setLocation(location) {
    this.location = location;
    this.setMapPadding();

    // the satellite selection path
    const satelliteRegEx = new RegExp(/^\/[0-9]+$/g);
    if (satelliteRegEx.test(location)) {
      const id = location.match(/[0-9]+/g)[0];
      this.setSelectedSatelliteID(id);
      this.setMapFilter(`norad = ${id}`);
    } else {
      this.setSelectedSatelliteID(null);
    }

    // the search path
    const searchRegEx = new RegExp(/^\/search/g);
    if (searchRegEx.test(location)) {
      this.setVisualizationType('search');
      this.setInSearch(true);
      const searchString = this.searchString;
      if (searchString) {
        this.setMapFilter(
          `LOWER(name) LIKE '%${searchString}%' OR LOWER(official_name) LIKE '%${searchString}%' OR LOWER(operator) LIKE '%${searchString}%'`
        );
      } else {
        this.setMapFilter(null);
      }
    }

    // the satellite usage path
    const usageRegEx = new RegExp(/^\/satellite-usage/g);
    if (usageRegEx.test(location)) {
      appStore.setVisualizationType('usage');
      this.setInSearch(false);
      this.setMapFilter(null);
    }
    if (location === '/') {
      this.setVisualizationType('general');
      this.setInSearch(false);
      this.setMapFilter(null);
      if (this.map) {
        console.log(this.map.layers);
      }
    }
  }

  setInSearch(value) {
    this.inSearch = value;
  }
  setSelectedSatelliteID(id) {
    this.selectedSatelliteID = id;
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
  setMapPadding() {
    if (this.location === '/') {
      this.mapPadding = [0, 0, 0, 0];
    } else {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 550) {
        this.mapPadding = [0, 0, clamp(250, 30, 400, height), 0];
      } else {
        this.mapPadding = [0, clamp(350, 30, 600, width), 0, 0];
      }
    }
  }
  setSearchString(searchString) {
    this.searchString = searchString;
  }
}

const mapStore = new MapStore();
const dataStore = new DataStore();
const appStore = new AppStore(dataStore, mapStore);

export default appStore;
