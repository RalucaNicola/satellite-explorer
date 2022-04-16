import * as styles from './Search.module.css';

import { SatellitesResults, FeaturedSatellitesList } from '../index';
import appStore from '../../stores/AppStore';
import dataStore from '../../stores/DataStore';
import mapStore from '../../stores/MapStore';

import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

export const Search = observer(() => {
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const getSuggestions = (searchString) => {
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
      console.log('results:');
      limitedFilteredData.forEach((f) =>
        console.log(`${f.metadata.name}, ${f.metadata.official_name}, ${f.metadata.operator}`)
      );
      setSearchResults(limitedFilteredData);
    } else {
      console.log('no results');
      setSearchResults(null);
    }
  };

  useEffect(() => {
    mapStore.setVisualizationType('search');
    mapStore.goToPosition('search');
    if (appStore.searchString) {
      setSearchString(appStore.searchString);
      getSuggestions(appStore.searchString);
    }
  }, []);

  function inputHandler(event) {
    const filter = event.target.value.toLowerCase();
    setSearchString(filter);
    if (filter && filter.length > 2) {
      appStore.setSearchString(filter);
      getSuggestions(filter);
    } else {
      appStore.setSearchString(null);
      setSearchResults(null);
    }
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.closeButton}
        onClick={() => {
          appStore.setActiveState('general');
          appStore.setSearchString(null);
        }}
      >
        <img src='./assets/close.svg'></img>
      </button>
      <div className={styles.header}>
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
            {dataStore.featuredSatellites ? (
              <FeaturedSatellitesList satellites={dataStore.featuredSatellites}></FeaturedSatellitesList>
            ) : (
              'Loading...'
            )}
          </>
        )}
      </div>
    </div>
  );
});
