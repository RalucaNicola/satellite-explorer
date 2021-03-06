import * as styles from './PageNotFound.module.css';
// import { Link } from 'react-router-dom';

export function PageNotFound() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stars}></div>
      <div className={styles.twinkling}></div>
      <div className={styles.textWrapper}>
        <img src='./assets/astronaut-notfound.png' />
        <p>
          Hey there! You went way beyond our galaxy and we can't find what you're looking for. But we can take you back
          to the <a href='/'>home page</a>.
        </p>
      </div>
    </div>
  );
}
