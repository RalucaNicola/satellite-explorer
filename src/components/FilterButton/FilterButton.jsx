import * as styles from './FilterButton.module.css';
import { useEffect, useState } from 'react';

export function FilterButton({ active, filter, clickHandler, children }) {
  const [activeState, setActiveState] = useState(active);
  useEffect(() => {
    setActiveState(active);
  }, [active]);
  return (
    <button
      className={`${styles.filterButton} ${styles[filter]} ${activeState ? styles.active : ''}`}
      onClick={() => {
        clickHandler({ filter });
      }}
    >
      {children}
    </button>
  );
}
