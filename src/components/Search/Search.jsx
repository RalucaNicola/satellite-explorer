import * as styles from './Search.module.css';
import appStore from '../../stores/AppStore';
import { BackButton } from '../BackButton';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
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
    }
    const limitedFilteredData = filteredData.slice(0, 100);
    setSearchResults(limitedFilteredData);
  }

  useEffect(() => {
    if (appStore.data) {
      const searchString = searchParams.get('filter');
      getSuggestions(searchString);
      appStore.setSearchString(searchString);
    }
  }, [searchParams, appStore.data]);

  function inputHandler(event) {
    const filter = event.target.value.toLowerCase();
    if (filter) {
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
        value={searchParams.get('filter') || ''}
      ></input>
      {searchResults.length ? (
        <ul className={styles.listResults}>
          {searchResults.map((satellite, index) => {
            const attr = satellite.metadata;
            const date = new Date(attr.launch_date);
            return (
              <li key={index}>
                <Link to={`/${satellite.norad}`} className={styles.satelliteLink}>
                  <h5>{attr.official_name}</h5>
                  <p>
                    {attr.operator}, {attr.country_operator} - {attr.launch_site}, {date.toLocaleDateString('en-US')}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No results found</p>
      )}
      <BackButton navigateTo={'/'}></BackButton>
    </div>
  );
};
