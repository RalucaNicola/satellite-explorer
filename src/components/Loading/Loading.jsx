import * as styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.loadingPanel}>
      <img className={styles.logo} src='./assets/satellite-animation.svg'></img>
    </div>
  );
}
