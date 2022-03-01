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
  browserLocation = null;
  location = null;
  visualizationFilter = null;
  visualizationType = null;
  mapPadding = [0, 0, 0, 0];

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
    switch (location) {
      case '/satellite-usage':
        this.setVisualizationType('usage');
        break;
      default:
        this.setVisualizationType('general');
    }
    this.setVisualizationFilter(null);
    this.setMapPadding();
  }
  setVisualizationFilter(filter) {
    this.visualizationFilter = filter;
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
}

const mapStore = new MapStore();
const dataStore = new DataStore();
const appStore = new AppStore(dataStore, mapStore);

export default appStore;
