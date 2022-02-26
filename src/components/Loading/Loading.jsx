import * as styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.loadingPanel}>
      <div className={styles.stars}></div>
      <div className={styles.twinkling}></div>
      <img src='./assets/loading.png'></img>
      <p>Loading and computing locations for thousands of satellites...</p>
    </div>
  );
}
