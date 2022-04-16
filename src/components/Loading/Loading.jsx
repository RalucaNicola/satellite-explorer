import * as styles from './Loading.module.css';

export function Loading() {
  return (
    <div className={styles.loadingPanel}>
      <object className={styles.logo} data='./assets/satellite-animation-js.svg'></object>
    </div>
  );
}
