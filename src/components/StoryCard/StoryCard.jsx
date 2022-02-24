import * as styles from './StoryCard.module.css';
import { Link } from 'react-router-dom';

export function StoryCard({ link, children }) {
  return (
    <li>
      <Link to={link} className={styles.storyLink}>
        <h3>
          <img src={'./assets/astronaut.png'} className={styles.listImage}></img>
          {children}
        </h3>
      </Link>
    </li>
  );
}
