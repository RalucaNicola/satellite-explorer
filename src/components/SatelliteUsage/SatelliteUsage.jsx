import * as styles from './SatelliteUsage.module.css';

import { filterDefinition } from '../../config';
import dataStore from '../../stores/DataStore';
import mapStore from '../../stores/MapStore';

import { Accordion, UsageChart, BackButton, FilterButton, InfoPanel } from '../index';

import { useEffect, useState } from 'react';

const nav = 'navigation';
const comm = 'communications';
const eo = 'earthObservation';
const so = 'spaceObservation';

export const SatelliteUsage = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const { countsByPurpose } = dataStore;
  const handleFilter = ({ filter }) => {
    setActiveFilter(filter);
    const filterExpression = filterDefinition[filter].expression;
    mapStore.setMapFilter(filterExpression);
  };
  useEffect(() => {
    handleFilter({ filter: nav });
    mapStore.setVisualizationType('usage');
    mapStore.goToPosition('home');
    return () => {
      mapStore.setMapFilter(null);
    };
  }, []);

  return (
    <InfoPanel>
      <BackButton toState='general'></BackButton>
      <h2>Why do we need satellites?</h2>
      <div className={styles.block}>
        Did you ever get your location on your phone or set the navigation system in the car to guide you to a
        destination? Then you've definitely used satellites.
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton filter={nav} active={activeFilter === nav} clickHandler={handleFilter}>
            Localization
          </FilterButton>{' '}
          via satellite navigation systems is widely used in almost all industries: transportation, emergency response,
          farming, banking, military, science. These satellites determine the location, velocity, and current time of
          small electronic devices (like the ones in our smart phones).
        </p>
        <Accordion title='Discover global navigation satellite systems'>
          <p>
            <FilterButton filter='gps' active={activeFilter === 'gps'} clickHandler={handleFilter}>
              GPS
            </FilterButton>{' '}
            - the United States' Global Positioning System, originally Navstar GPS, was launched in 1973, by the U.S.
            Department of Defence.
          </p>
          <p>
            <FilterButton filter='glonass' active={activeFilter === 'glonass'} clickHandler={handleFilter}>
              GLONASS
            </FilterButton>{' '}
            - the Russian space based satellite navigation system. Its development began in 1976.
          </p>
          <p>
            <FilterButton filter='beidou' active={activeFilter === 'beidou'} clickHandler={handleFilter}>
              BeiDou
            </FilterButton>{' '}
            - the Chinese global navigation system. The first system was launched in 2000.
          </p>
          <p>
            <FilterButton filter='galileo' active={activeFilter === 'galileo'} clickHandler={handleFilter}>
              Galileo
            </FilterButton>{' '}
            - created by the European Union through the Europen Space Agency. It went live in 2016.
          </p>
        </Accordion>
        {countsByPurpose ? <UsageChart category={nav} data={countsByPurpose} label={nav}></UsageChart> : ''}
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton filter={comm} active={activeFilter === comm} clickHandler={handleFilter}>
            Communications
          </FilterButton>{' '}
          satellites are used for television, radio, and internet broadcasting. This sector increased lately with more
          and more companies launching satellites to provide internet everywhere on the globe.
        </p>
        {countsByPurpose ? <UsageChart category={comm} data={countsByPurpose} label={comm}></UsageChart> : ''}
        <Accordion title='Biggest communications satellite systems'>
          <p>
            <FilterButton filter='starlink' active={activeFilter === 'starlink'} clickHandler={handleFilter}>
              Starlink
            </FilterButton>{' '}
            a satellite internet constellation operated by SpaceX providing satellite Internet access coverage to most
            of the Earth.
          </p>
          <p>
            <FilterButton filter='oneweb' active={activeFilter === 'oneweb'} clickHandler={handleFilter}>
              OneWeb
            </FilterButton>{' '}
            a communications company whose focus is to deliver broadband satellite Internet services worldwide.
          </p>
          <p>
            <FilterButton filter='iridium' active={activeFilter === 'iridium'} clickHandler={handleFilter}>
              Iridium
            </FilterButton>{' '}
            an operational constellation of 66 active satellites used to provide global satellite phone service.
          </p>
          <p>
            <FilterButton filter='globalstar' active={activeFilter === 'globalstar'} clickHandler={handleFilter}>
              GlobalStar
            </FilterButton>{' '}
            a satellite phone and low-speed data communications.
          </p>
        </Accordion>
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton filter={eo} active={activeFilter === eo} clickHandler={handleFilter}>
            Earth Observation
          </FilterButton>{' '}
          satellites provide information about earth resources, weather, climate, and environmental monitoring. Imaging
          satellites produce high-resolution data of almost the entire landmass on earth.
        </p>
        {countsByPurpose ? (
          <UsageChart category={eo} data={countsByPurpose} label='earth observation'></UsageChart>
        ) : (
          ''
        )}
        <Accordion title='Earth observation satellite systems'>
          <p>
            <FilterButton filter='landsat' active={activeFilter === 'landsat'} clickHandler={handleFilter}>
              Landsat program
            </FilterButton>{' '}
            a joint NASA / USGS program launched on 23 July 1972.
          </p>
          <p>
            <FilterButton filter='doves' active={activeFilter === 'doves'} clickHandler={handleFilter}>
              Doves satellites
            </FilterButton>{' '}
            operated by Planet Labs PBC, the Doves satellites weigh only 5.8 kg each and provides 3-meter multispectral
            image resolution for humanitarian and environmental applications, from monitoring deforestation and
            urbanization to improving natural disaster relief, and agricultural yields around the world.
          </p>
        </Accordion>
      </div>
      <div className={styles.block}>
        <p>
          <FilterButton filter={so} active={activeFilter === so} clickHandler={handleFilter}>
            Space Observation
          </FilterButton>{' '}
          also benefits from satellite data: satellite telescopes have been critical to understanding phenomena like
          pulsars and black holes as well as measuring the age of the universe.
        </p>
        {countsByPurpose ? (
          <UsageChart category={so} data={countsByPurpose} label='space observation'></UsageChart>
        ) : (
          ''
        )}
      </div>
      <BackButton toState='general'></BackButton>
    </InfoPanel>
  );
};
