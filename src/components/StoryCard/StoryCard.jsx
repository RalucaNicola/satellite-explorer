import * as styles from './StoryCard.module.css';
import { Link } from 'react-router-dom';

export function StoryCard({ link, image, children }) {
  return (
    <li>
      <Link to={link} className={styles.storyLink}>
        <img src={image} className={styles.listImage}></img>
        <p className={styles.title}>{children}</p>
      </Link>
    </li>
  );
}
