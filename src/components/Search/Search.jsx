import * as styles from './Search.module.css';
import appStore from '../../stores/AppStore';
import { BackButton } from '../BackButton';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SatellitesResults } from '../SatellitesResults';

export const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [featuredSatellites, setFeaturedSatellites] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  function getSuggestions(searchString) {
    let filteredData = [...appStore.data];
    if (searchString) {
      const searchRegExp = new RegExp(searchString, 'i');
      filteredData = appStore.data.filter((satellite) => {
        return (
          satellite.metadata.name.search(searchRegExp) >= 0 ||
          satellite.metadata.official_name.search(searchRegExp) >= 0 ||
          satellite.metadata.operator.search(searchRegExp) >= 0
        );
      });
      const limitedFilteredData = filteredData.slice(0, 100);
      setSearchResults(limitedFilteredData);
    } else {
      setSearchResults(null);
    }
  }

  useEffect(() => {
    if (appStore.data) {
      const searchString = searchParams.get('filter');
      getSuggestions(searchString);
      appStore.setSearchString(searchString);
      if (featuredSatellites.length === 0) {
        setFeaturedSatellites(appStore.data.filter((satellite) => satellite.featuredSatellite));
      }
    }
  }, [searchParams, appStore.data]);

  function inputHandler(event) {
    const filter = event.target.value.toLowerCase();
    if (filter && filter.length > 2) {
      setSearchParams({ filter });
    } else {
      setSearchParams({});
    }
  }

  return (
    <div className={styles.menu}>
      <BackButton navigateTo={'/'}></BackButton>
      <h2>Search satellites</h2>
      <input
        className={styles.searchInput}
        type='text'
        onChange={inputHandler}
        placeholder='Search by name or operator'
        {...(searchParams.get('filter') ? { value: searchParams.get('filter') } : {})}
      ></input>
      {searchResults ? (
        searchResults.length ? (
          <SatellitesResults satellites={searchResults}></SatellitesResults>
        ) : (
          <p>No results found</p>
        )
      ) : (
        <>
          <p>Featured satellites</p>
          {featuredSatellites ? <SatellitesResults satellites={featuredSatellites}></SatellitesResults> : 'Loading...'}
        </>
      )}
      <BackButton navigateTo={'/'}></BackButton>
    </div>
  );
};
