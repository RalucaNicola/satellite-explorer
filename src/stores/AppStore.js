import MapStore from './MapStore';
import DataStore from './DataStore';
import { makeAutoObservable } from 'mobx';

class AppStore {
  map = null;
  data = null;
  isLoading = true;
  viewIsReady = false;

  constructor(dataStore, mapStore) {
    makeAutoObservable(this);
    (async () => {
      this.data = await dataStore.fetchData();
      const map = await mapStore.initializeMap(this.data);
      this.setMap(map);
      this.setIsLoading(false);
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
}

const mapStore = new MapStore();
const dataStore = new DataStore();
const appStore = new AppStore(dataStore, mapStore);

export default appStore;
