import { action, makeObservable, observable, computed } from 'mobx';
import { clamp } from '../utils/utils';
import mapStore from './MapStore';

class AppStore {
  viewLoading = true;
  dataLoading = true;
  activeState = null;
  previousState = null;
  displayAbout = false;
  appPadding = [0, 0, 0, 0];
  searchString = null;

  constructor() {
    makeObservable(this, {
      viewLoading: observable,
      setViewLoading: action,
      dataLoading: observable,
      setDataLoading: action,
      isLoading: computed,
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

  get isLoading() {
    console.log(this.viewLoading, this.dataLoading);
    return this.viewLoading || this.dataLoading;
  }

  setViewLoading(value) {
    this.viewLoading = value;
  }

  setDataLoading(value) {
    this.dataLoading = value;
  }

  setActiveState(value) {
    this.previousState = this.activeState;
    this.activeState = value;
    this.setAppPadding();

    if (value === 'general') {
      mapStore.setVisualizationType('general');
      mapStore.setMapFilter(null);
    }
    mapStore.clearPopup();
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
  }
}

const appStore = new AppStore();

export default appStore;
