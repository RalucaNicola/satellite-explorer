import * as styles from './OrbitCard.module.css';
import { useAppState } from '../AppState';

export function OrbitCard({ onClick, imgSource, type, children }) {
  const { dispatch } = useAppState();
  const filterData = () => {
    dispatch({ type: 'FILTER', payload: type });
  };
  const removeFilter = () => {
    dispatch({ type: 'FILTER', payload: 'none' });
  };
  return (
    <div className={styles.card} onClick={onClick} onMouseEnter={filterData} onMouseLeave={removeFilter}>
      <div className={styles.leftCard}>
        <img src={imgSource}></img>
      </div>
      <div className={styles.rightCard}>{children}</div>
    </div>
  );
}
