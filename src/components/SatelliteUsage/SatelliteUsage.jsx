import * as styles from './SatelliteUsage.module.css';
import { Link } from 'react-router-dom';
import { FilterButton } from '../FilterButton';
import { useEffect, useState } from 'react';
import appStore from '../../stores/AppStore';
import { filterDefinition } from '../../config';
import { UsageChart } from '../UsageChart';
import { Accordion } from '../Accordion';

const navigation = filterDefinition.navigation.id;
const communications = filterDefinition.communications.id;
const earthObservation = filterDefinition.earthObservation.id;
const spaceObservation = filterDefinition.spaceObservation.id;

export const SatelliteUsage = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [isConstellation, setIsConstellation] = useState(false);
  const [countsByPurpose, setCountsByPurpose] = useState(null);
  const handleFilter = ({ filter, constellation }) => {
    setActiveFilter(filter);
    appStore.setVisualizationFilter(filter);
    if (constellation !== isConstellation) {
      setIsConstellation(constellation);
    }
  };
  useEffect(() => {
    if (appStore.data) {
      setCountsByPurpose(appStore.getCountsByPurpose());
    }
  }, [appStore.data]);

  useEffect(() => {
    if (isConstellation) {
      appStore.setVisualizationType('usage-constellation');
    } else {
      appStore.setVisualizationType('usage');
    }
  }, [isConstellation]);

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
          <FilterButton
            filter={navigation}
            active={activeFilter === navigation}
            clickHandler={handleFilter}
            constellation={false}
          >
            Position
          </FilterButton>{' '}
          via satellite navigation systems is widely used in almost all industries: transportation, emergency response,
          farming, banking, military, science. These satellites determine the location, velocity and current time of
          small electronic devices (like the ones in our smart phones).
        </p>
        {countsByPurpose ? <UsageChart category={navigation} data={countsByPurpose}></UsageChart> : ''}
        <Accordion title='Show navigation satellite systems'>
          <p>
            <FilterButton filter='gps' active={activeFilter === 'gps'} clickHandler={handleFilter} constellation={true}>
              GPS
            </FilterButton>{' '}
            - the United States' Global Positioning System, originally Navstar GPS, was launched in 1973, by the U.S.
            Department of Defence.
          </p>
          <p>
            <FilterButton
              filter='glonass'
              active={activeFilter === 'glonass'}
              clickHandler={handleFilter}
              constellation={true}
            >
              GLONASS
            </FilterButton>{' '}
            - the Russian space based satellite navigation system. Its development began in 1976.
          </p>
          <p>
            <FilterButton
              filter='beidou'
              active={activeFilter === 'beidou'}
              clickHandler={handleFilter}
              constellation={true}
            >
              BeiDou
            </FilterButton>{' '}
            - the Chinese global navigation system. The first system was launched in 2000.
          </p>
          <p>
            <FilterButton
              filter='galileo'
              active={activeFilter === 'galileo'}
              clickHandler={handleFilter}
              constellation={true}
            >
              Galileo
            </FilterButton>{' '}
            - created by the European Union through the Europen Space Agency. It went live in 2016.
          </p>
        </Accordion>
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton
            filter={communications}
            active={activeFilter === communications}
            clickHandler={handleFilter}
            constellation={false}
          >
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
            constellation={false}
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
            constellation={false}
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
