import * as styles from './StoryCard.module.css';
import { Link } from '../index';

export function StoryCard({ toState, image, children }) {
  return (
    <li>
      <Link toState={toState}>
        <div className={styles.storyLink}>
          <img src={image} className={styles.listImage}></img>
          <p className={styles.title}>{children}</p>
        </div>
      </Link>
    </li>
  );
}
