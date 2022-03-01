import * as styles from './Search.module.css';
import appStore from '../../stores/AppStore';
import { BackButton } from '../BackButton';
import { debounce } from '../../utils/utils';
import { useEffect, useState } from 'react';

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  function getSuggestions(searchString) {
    const searchRegExp = new RegExp(searchString, 'i');
    const filteredData = appStore.data.filter((satellite) => {
      return (
        satellite.metadata.name.search(searchRegExp) >= 0 || satellite.metadata.official_name.search(searchRegExp) >= 0
      );
    });
    const limitedFilteredData = filteredData.slice(0, 50);
    console.log(limitedFilteredData);
    setSearchResults(limitedFilteredData);
  }
  const getLazySuggestions = debounce(getSuggestions, 250);

  useEffect(() => {
    getLazySuggestions(searchTerm);
  }, [searchTerm]);

  function inputHandler(event) {
    setSearchTerm(event.target.value);
  }

  function focusHandler() {
    getLazySuggestions(searchTerm);
  }

  return (
    <div className={styles.menu}>
      <BackButton></BackButton>
      <h2>Search satellites</h2>
      <input
        className={styles.searchInput}
        type='text'
        onInput={inputHandler}
        onFocus={focusHandler}
        placeholder='Search by name or operator'
      ></input>
      {searchResults.length ? (
        <ul className={styles.listResults}>
          {searchResults.map((satellite) => {
            const attr = satellite.metadata;
            const date = new Date(attr.launch_date);
            return (
              <li key={satellite.norad}>
                <h5>{attr.official_name}</h5>
                <p>
                  {attr.operator}, {attr.country_operator} - {attr.launch_site}, {date.toLocaleDateString('en-US')}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No results found</p>
      )}

      <BackButton></BackButton>
    </div>
  );
};
