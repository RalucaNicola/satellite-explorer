import * as styles from './SatelliteUsage.module.css';
import { filterDefinition } from '../../config';
import { FilterButton } from '../FilterButton';
import { useEffect, useState } from 'react';
import appStore from '../../stores/AppStore';
import { UsageChart } from '../UsageChart';
import { Accordion } from '../Accordion';
import { BackButton } from '../BackButton';

const navigation = filterDefinition.navigation.id;
const communications = filterDefinition.communications.id;
const earthObservation = filterDefinition.earthObservation.id;
const spaceObservation = filterDefinition.spaceObservation.id;
const technologyDevelopment = filterDefinition.technologyDevelopment.id;

export const SatelliteUsage = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [isConstellation, setIsConstellation] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [countsByPurpose, setCountsByPurpose] = useState(null);
  const handleFilter = ({ filter, constellation }) => {
    setActiveFilter(filter);
    if (filter) {
      setIsFiltered(true);
    }
    const filterExpression = filterDefinition[filter].expression;
    appStore.setMapFilter(filterExpression);
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
    } else if (isFiltered) {
      appStore.setVisualizationType('usage-filtered');
    } else {
      appStore.setVisualizationType('usage');
    }
  }, [isConstellation, isFiltered]);

  return (
    <div className={styles.menu}>
      <BackButton></BackButton>
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
            Localization
          </FilterButton>{' '}
          via satellite navigation systems is widely used in almost all industries: transportation, emergency response,
          farming, banking, military, science. These satellites determine the location, velocity and current time of
          small electronic devices (like the ones in our smart phones).
        </p>
        {countsByPurpose ? <UsageChart category={navigation} data={countsByPurpose}></UsageChart> : ''}
        <Accordion title='Global navigation satellite systems'>
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
        <Accordion title='Biggest communications satellite systems'>
          <p>
            <FilterButton
              filter='starlink'
              active={activeFilter === 'starlink'}
              clickHandler={handleFilter}
              constellation={true}
            >
              Starlink
            </FilterButton>{' '}
            a satellite internet constellation operated by SpaceX providing satellite Internet access coverage to most
            of the Earth.
          </p>
          <p>
            <FilterButton
              filter='oneweb'
              active={activeFilter === 'oneweb'}
              clickHandler={handleFilter}
              constellation={true}
            >
              OneWeb
            </FilterButton>{' '}
            a communications company whose focus is to deliver broadband satellite Internet services worldwide.
          </p>
          <p>
            <FilterButton
              filter='iridium'
              active={activeFilter === 'iridium'}
              clickHandler={handleFilter}
              constellation={true}
            >
              Iridium
            </FilterButton>{' '}
            an operational constellation of 66 active satellites used to provide global satellite phone service.
          </p>
          <p>
            <FilterButton
              filter='globalstar'
              active={activeFilter === 'globalstar'}
              clickHandler={handleFilter}
              constellation={true}
            >
              GlobalStar
            </FilterButton>{' '}
            a satellite phone and low-speed data communications.
          </p>
        </Accordion>
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
        <Accordion title='Earth observation satellite systems'>
          <p>
            <FilterButton
              filter='landsat'
              active={activeFilter === 'landsat'}
              clickHandler={handleFilter}
              constellation={true}
            >
              Landsat programme
            </FilterButton>{' '}
            a joint NASA / USGS program launched on 23 July 1972.
          </p>
          <p>
            <FilterButton
              filter='doves'
              active={activeFilter === 'doves'}
              clickHandler={handleFilter}
              constellation={true}
            >
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
      <div className={styles.block}>
        <p>
          <FilterButton
            filter={technologyDevelopment}
            active={activeFilter === technologyDevelopment}
            clickHandler={handleFilter}
            constellation={false}
          >
            Technology development
          </FilterButton>{' '}
          to do: add description here
        </p>
        {countsByPurpose ? <UsageChart category={technologyDevelopment} data={countsByPurpose}></UsageChart> : ''}
      </div>
      <BackButton></BackButton>
    </div>
  );
};
