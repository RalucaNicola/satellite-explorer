import * as styles from './SatelliteUsage.module.css';
import { Link } from 'react-router-dom';
import { FilterButton } from '../FilterButton';
import { useState } from 'react';
import appStore from '../../stores/AppStore';
import { filterDefinition } from '../../config';

const navigation = filterDefinition.navigation.id;
const communications = filterDefinition.communications.id;
const earthObservation = filterDefinition.earthObservation.id;
const spaceObservation = filterDefinition.spaceObservation.id;

export function SatelliteUsage() {
  const [activeFilter, setActiveFilter] = useState(null);
  const handleFilter = (filter) => {
    setActiveFilter(filter);
    appStore.setVisualizationFilter(filter);
  };
  return (
    <div className={styles.menu}>
      <h2>Why do we need satellites?</h2>
      <p>
        Did you ever get your location on your phone or set the navigation system in the car to guide you to a
        destination? Or did you buy products in an airplane using your credit card or used the internet connection on a
        plane? Then you've definitely used satellites.
      </p>
      <p>
        <FilterButton filter={navigation} active={activeFilter === navigation} clickHandler={handleFilter}>
          Position
        </FilterButton>{' '}
        via satellite navigation systems is widely used in almost all industries: transportation, emergency response,
        farming, banking, military, science. These satellites determine the location, velocity and current time of small
        electronic devices (like the ones in our smart phones).
      </p>
      <p>
        <FilterButton filter={communications} active={activeFilter === communications} clickHandler={handleFilter}>
          Communications
        </FilterButton>{' '}
        satellites are used for television, radio and internet broadcasting. This sector increased lately with more and
        more companies launching satellites to provide internet everywhere on the globe.
      </p>
      <p>
        <FilterButton filter={earthObservation} active={activeFilter === earthObservation} clickHandler={handleFilter}>
          Earth Observation
        </FilterButton>{' '}
        satellites provide information about earth resources, weather, climate and environmental monitoring. Imaging
        satellites produce high-resolution data of almost the entire landmass on earth.
      </p>
      <p>
        <FilterButton filter={spaceObservation} active={activeFilter === spaceObservation} clickHandler={handleFilter}>
          Space Observation
        </FilterButton>{' '}
        also benefits from satellite data: satellite telescopes have been critical to understanding phenomena like
        pulsars and black holes as well as measuring the age of the universe.
      </p>
      <Link to='/'>Back to homepage</Link>
    </div>
  );
}
