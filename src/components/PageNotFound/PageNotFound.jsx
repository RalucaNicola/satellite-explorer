import { Link } from 'react-router-dom';
import * as styles from './PageNotFound.module.css';

export function PageNotFound() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stars}></div>
      <div className={styles.twinkling}></div>
      <img src='./assets/astronaut-notfound.png' />
      <p>
        Hey there! You went way beyond our galaxy and we can't find what you're looking for. But we can take you back to
        the <Link to='/'>home page</Link>.
      </p>
    </div>
  );
}
