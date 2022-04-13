import * as styles from './StoryCard.module.css';
import { Link } from '../index';

export function StoryCard({ toState, title, description }) {
  return (
    <li className={styles.overrideLink}>
      <Link toState={toState}>
        <div className={styles.storyLink}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
        </div>
      </Link>
    </li>
  );
}
