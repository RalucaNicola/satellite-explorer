import * as styles from './SatelliteUsage.module.css';
import { Link } from 'react-router-dom';
import { FilterButton } from '../FilterButton';
import { useEffect, useState } from 'react';
import appStore from '../../stores/AppStore';
import { filterDefinition } from '../../config';
import { UsageChart } from '../UsageChart';

const navigation = filterDefinition.navigation.id;
const communications = filterDefinition.communications.id;
const earthObservation = filterDefinition.earthObservation.id;
const spaceObservation = filterDefinition.spaceObservation.id;

export const SatelliteUsage = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [countsByPurpose, setCountsByPurpose] = useState(null);
  const handleFilter = (filter) => {
    setActiveFilter(filter);
    appStore.setVisualizationFilter(filter);
  };
  useEffect(() => {
    if (appStore.data) {
      console.log('this is the data');
      setCountsByPurpose(appStore.getCountsByPurpose());
    }
  }, [appStore.data]);

  return (
    <div className={styles.menu}>
      <h2>Why do we need satellites?</h2>
      <div className={styles.block}>
        Did you ever get your location on your phone or set the navigation system in the car to guide you to a
        destination? Or did you buy products in an airplane using your credit card or used the internet connection on a
        plane? Then you've definitely used satellites.
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton filter={navigation} active={activeFilter === navigation} clickHandler={handleFilter}>
            Position
          </FilterButton>{' '}
          via satellite navigation systems is widely used in almost all industries: transportation, emergency response,
          farming, banking, military, science. These satellites determine the location, velocity and current time of
          small electronic devices (like the ones in our smart phones).
        </p>
        {countsByPurpose ? <UsageChart category={navigation} data={countsByPurpose}></UsageChart> : ''}
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton filter={communications} active={activeFilter === communications} clickHandler={handleFilter}>
            Communications
          </FilterButton>{' '}
          satellites are used for television, radio and internet broadcasting. This sector increased lately with more
          and more companies launching satellites to provide internet everywhere on the globe.
        </p>
        {countsByPurpose ? <UsageChart category={communications} data={countsByPurpose}></UsageChart> : ''}
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton
            filter={earthObservation}
            active={activeFilter === earthObservation}
            clickHandler={handleFilter}
          >
            Earth Observation
          </FilterButton>{' '}
          satellites provide information about earth resources, weather, climate and environmental monitoring. Imaging
          satellites produce high-resolution data of almost the entire landmass on earth.
        </p>
        {countsByPurpose ? <UsageChart category={earthObservation} data={countsByPurpose}></UsageChart> : ''}
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton
            filter={spaceObservation}
            active={activeFilter === spaceObservation}
            clickHandler={handleFilter}
          >
            Space Observation
          </FilterButton>{' '}
          also benefits from satellite data: satellite telescopes have been critical to understanding phenomena like
          pulsars and black holes as well as measuring the age of the universe.
        </p>
        {countsByPurpose ? <UsageChart category={spaceObservation} data={countsByPurpose}></UsageChart> : ''}
      </div>
      <Link to='/'>Back to homepage</Link>
    </div>
  );
};
