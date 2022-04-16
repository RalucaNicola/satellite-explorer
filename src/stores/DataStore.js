import satellites from '../services/satellites';
import { group } from 'd3-array';
import { purposeCategories, orbitTypes } from '../config';

class DataStore {
  data = satellites;

  constructor() {
    this.countsByPurpose = this.getCountsByPurpose();
    this.countsByOrbit = this.getCountsByOrbit();
    this.countsByCountry = this.getCountsByCountry();
    this.countsByOperator = this.getCountsByOperator();
    this.featuredSatellites = this.getFeaturedSatellites();
  }

  getCountsByPurpose() {
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

  getCountsByOrbit() {
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

  getCountsByCountry() {
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

  getCountsByOperator() {
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

  getFeaturedSatellites() {
    return this.data.filter((satellite) => satellite.featuredSatellite);
  }

  getSatelliteById(id) {
    return this.data.filter((satellite) => satellite.norad === parseInt(id))[0];
  }
}

const dataStore = new DataStore();

export default dataStore;
