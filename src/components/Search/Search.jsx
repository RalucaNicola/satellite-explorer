import * as styles from './Search.module.css';

import { BackButton, SatellitesResults } from '../index';
import appStore from '../../stores/AppStore';
import dataStore from '../../stores/DataStore';
import mapStore from '../../stores/MapStore';

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

export const Search = observer(() => {
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [featuredSatellites, setFeaturedSatellites] = useState([]);

  function getSuggestions(searchString) {
    let filteredData = [...dataStore.data];
    if (searchString) {
      const searchRegExp = new RegExp(searchString, 'i');
      filteredData = dataStore.data.filter((satellite) => {
        return (
          satellite.metadata.name.search(searchRegExp) >= 0 ||
          satellite.metadata.official_name.search(searchRegExp) >= 0 ||
          satellite.metadata.operator.search(searchRegExp) >= 0
        );
      });
      const limitedFilteredData = filteredData.slice(0, 30);
      setSearchResults(limitedFilteredData);
    } else {
      setSearchResults(null);
    }
  }

  useEffect(() => {
    getSuggestions(appStore.searchString);

    if (!appStore.searchString && featuredSatellites.length === 0) {
      setFeaturedSatellites(dataStore.data.filter((satellite) => satellite.featuredSatellite));
    }
  }, [appStore.searchString]);

  function inputHandler(event) {
    const filter = event.target.value.toLowerCase();
    setSearchString(filter);
    if (filter && filter.length > 2) {
      appStore.setSearchString(filter);
    } else {
      appStore.setSearchString(null);
    }
  }

  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <BackButton
          toState='general'
          onClick={() => {
            appStore.setSearchString(null);
          }}
        ></BackButton>
        <h2>Search satellites</h2>
        <input
          className={styles.searchInput}
          type='text'
          onChange={inputHandler}
          placeholder='Search by name or operator'
          value={appStore.searchString ? appStore.searchString : searchString}
        ></input>
        {searchString ? (
          <button
            className={styles.clearButton}
            onClick={() => {
              inputHandler({ target: { value: '' } });
            }}
          >
            <img src='./assets/close.svg' />
          </button>
        ) : (
          <></>
        )}
      </div>
      <div className={styles.results}>
        {searchResults ? (
          searchResults.length ? (
            <SatellitesResults satellites={searchResults}></SatellitesResults>
          ) : (
            <p>No results found</p>
          )
        ) : (
          <>
            <p>Featured satellites</p>
            {featuredSatellites ? (
              <SatellitesResults satellites={featuredSatellites}></SatellitesResults>
            ) : (
              'Loading...'
            )}
          </>
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.updatesContainer}>
          Satellite positions generated on{' '}
          {new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(mapStore.positionTime)}.{' '}
          <a
            onClick={() => {
              mapStore.updateCurrentSatellites(dataStore.data);
            }}
          >
            Update satellite positions
          </a>
        </div>
        <BackButton
          toState='general'
          onClick={() => {
            appStore.setSearchString(null);
          }}
        ></BackButton>
      </div>
    </div>
  );
});
