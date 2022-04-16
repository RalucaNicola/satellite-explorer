import { action, makeObservable, observable } from 'mobx';
import { clamp } from '../utils/utils';
import mapStore from './MapStore';

class AppStore {
  isLoading = true;
  activeState = null;
  previousState = null;
  displayAbout = false;
  appPadding = [0, 0, 0, 0];
  searchString = null;

  constructor() {
    makeObservable(this, {
      isLoading: observable,
      setIsLoading: action,
      activeState: observable,
      setActiveState: action,
      previousState: false,
      appPadding: observable.ref,
      setAppPadding: action,
      searchString: observable,
      setSearchString: action,
      displayAbout: observable,
      setDisplayAbout: action
    });
    window.addEventListener('resize', this.setAppPadding.bind(this));
  }

  setIsLoading(value) {
    this.isLoading = value;
  }

  setActiveState(value) {
    this.previousState = this.activeState;
    this.activeState = value;
    this.setAppPadding();

    if (value === 'general') {
      mapStore.setVisualizationType('general');
      mapStore.setMapFilter(null);
    }
  }

  setDisplayAbout(value) {
    this.displayAbout = value;
  }

  setAppPadding() {
    if (this.activeState === 'general' || this.activeState === 'about' || this.activeState === 'search') {
      this.appPadding = [50, 0, 0, 0];
    } else {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 700) {
        this.appPadding = [50, 0, clamp(250, 30, 400, height), 0];
      } else {
        this.appPadding = [50, clamp(350, 40, 600, width), 0, 0];
      }
    }
    mapStore.setMapPadding(this.appPadding);
  }

  setSearchString(searchString) {
    this.searchString = searchString;
    console.log(searchString);
  }
}

const appStore = new AppStore();

export default appStore;
