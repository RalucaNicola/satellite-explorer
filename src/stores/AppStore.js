import { action, makeObservable, observable } from 'mobx';
import { clamp, updateHashParam } from '../utils/utils';
import mapStore from './MapStore';
import dataStore from './DataStore';

class AppStore {
  isLoading = true;
  activeState = null;
  appPadding = [0, 0, 0, 0];
  searchString = null;
  selectedSatellite = null;
  inSearch = false;

  constructor() {
    makeObservable(this, {
      selectedSatellite: observable.ref,
      setSelectedSatellite: action,
      isLoading: observable,
      setIsLoading: action,
      activeState: observable,
      setActiveState: action,
      appPadding: observable,
      setAppPadding: action,
      searchString: observable,
      setSearchString: action,
      inSearch: false
    });
    mapStore.initializeMap(dataStore.data);
    window.addEventListener('resize', this.setAppPadding.bind(this));
  }

  setIsLoading(value) {
    this.isLoading = value;
  }

  setActiveState(value) {
    this.activeState = value;
    this.setAppPadding();

    if (value === 'satellite') {
      mapStore.setVisualizationType('satellite');
    }

    if (value === 'general' || value === 'about') {
      mapStore.setVisualizationType('general');
      mapStore.setMapFilter(null);
      mapStore.gotoPosition('home');
    }

    if (value === 'orbits') {
      mapStore.setVisualizationType('orbits');
      mapStore.drawOrbitRanges(true);
      mapStore.setMapFilter('1=2');
      mapStore.gotoPosition('home');
    } else {
      mapStore.drawOrbitRanges(false);
    }

    if (value === 'search') {
      mapStore.setVisualizationType('search');
      this.setInSearch(true);
      mapStore.gotoPosition('home');
    }

    if (value === 'usage') {
      mapStore.setVisualizationType('usage');
      mapStore.gotoPosition('home');
    }

    if (value === 'owners') {
      mapStore.setVisualizationType('owners');
      mapStore.gotoPosition('home');
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

  setAppPadding() {
    if (this.activeState === 'general' || this.activeState === 'about') {
      this.appPadding = [0, 0, 0, 0];
    } else {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 550) {
        this.appPadding = [0, 0, clamp(250, 30, 400, height), 0];
      } else {
        this.appPadding = [0, clamp(350, 40, 600, width), 0, 0];
      }
    }
    mapStore.setMapPadding(this.appPadding);
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
}

const appStore = new AppStore();

export default appStore;
