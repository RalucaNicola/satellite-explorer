import * as styles from './SatelliteOwners.module.css';

import dataStore from '../../stores/DataStore';
import mapStore from '../../stores/MapStore';

import { BackButton, FilterButton, CountriesChart, BarChart, InfoPanel } from '../index';

import { useEffect, useState } from 'react';
import { filterDefinition } from '../../config';
import { formatNumber } from '../../utils/utils';

const spacex = 'spacex';
const oneweb = 'oneweboperator';
const planetlabs = 'planetlabs';
const nofilter = 'nofilter';

export const SatelliteOwners = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const { countsByCountry, countsByOperator } = dataStore;

  const handleFilter = ({ filter }) => {
    if (filter === nofilter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
    const filterExpression = filterDefinition[filter].expression;
    mapStore.setMapFilter(filterExpression);
  };

  useEffect(() => {
    mapStore.setVisualizationType('owners');
    mapStore.goToPosition('home');
    return () => {
      mapStore.setMapFilter(null);
    };
  }, []);
  return (
    <InfoPanel>
      <BackButton toState='general'></BackButton>
      <h2>Who owns all the satellites?</h2>
      <div className={styles.block}>
        There are thousands of active satellites out there and 75 different countries have at least one satellite
        orbiting Earth. United States, China, and United Kingdom top the list of countries with hundreds of operational
        satellites.
        <div>{countsByCountry ? <CountriesChart data={countsByCountry}></CountriesChart> : ''} </div>
      </div>
      <div className={styles.block}>
        <h3>Satellites by operator</h3>
        When looking at individual satellite operators we can see that private companies own most of the active
        satellites. SpaceX is the big winner, with{' '}
        {countsByOperator ? formatNumber(countsByOperator.list[0].value) : ''} satellites as of January 2022.
      </div>
      <div className={styles.block}>
        {countsByOperator ? <BarChart rank={0} data={countsByOperator} rgbColor={'rgb(255,255,255)'}></BarChart> : ''}
        <div className={styles.shortInfo}>
          <p>
            Space Exploration Technologies Corp. is an aerospace manufacturer, a provider of space transportation
            services, and a communications corporation.
          </p>
          <p>Founding year: 2002.</p> <p>Headquarters: Hawthorne, California, United States.</p>
          <p>
            Learn more:{' '}
            <a href='https://www.spacex.com/' target='_blank'>
              https://www.spacex.com/
            </a>
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <FilterButton filter={spacex} active={activeFilter === spacex} clickHandler={handleFilter}>
            Filter SpaceX satellites
          </FilterButton>
        </div>
      </div>
      <div className={styles.block}>
        {countsByOperator ? <BarChart rank={1} data={countsByOperator} rgbColor={'rgb(255,255,255)'}></BarChart> : ''}
        <div className={styles.shortInfo}>
          <p>
            <a href='https://oneweb.net/' target='_blank'>
              OneWeb
            </a>{' '}
            is a communications company that builds broadband satellite Internet services. Their goal is to provide
            internet for everyone, everywhere.
          </p>{' '}
          <p>Founding year: 2012.</p> <p>Headquarters: London, United Kingdom.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <FilterButton filter={oneweb} active={activeFilter === oneweb} clickHandler={handleFilter}>
            Filter OneWeb satellites
          </FilterButton>
        </div>
      </div>
      <div className={styles.block}>
        {countsByOperator ? <BarChart rank={2} data={countsByOperator} rgbColor={'rgb(255,255,255)'}></BarChart> : ''}
        <div className={styles.shortInfo}>
          <p>
            PlanetLabs revolutionizes the earth observation industry with the highest frequency satellite data
            commercially available.
          </p>
          <p>Founding year: 2010.</p> <p>Headquarters: San Francisco, United States.</p>
          <p>
            {' '}
            Learn more:{' '}
            <a href='https://www.planet.com/' target='_blank'>
              https://www.planet.com/
            </a>
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <FilterButton filter={planetlabs} active={activeFilter === planetlabs} clickHandler={handleFilter}>
            {' '}
            Filter PlanetLabs satellites
          </FilterButton>
        </div>
      </div>
      <div className={styles.block}>
        Other operators:
        {countsByOperator
          ? [3, 4, 5, 6, 7, 8, 9].map((rank, index) => {
              return (
                <BarChart key={index} rank={rank} data={countsByOperator} rgbColor={'rgb(255,255,255)'}></BarChart>
              );
            })
          : ''}
      </div>
      <div style={{ textAlign: 'center' }}>
        <FilterButton filter={nofilter} clickHandler={handleFilter}>
          Remove filters
        </FilterButton>
      </div>
      <BackButton toState='general'></BackButton>
    </InfoPanel>
  );
};
