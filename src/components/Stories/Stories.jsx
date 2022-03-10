import * as styles from './Stories.module.css';
import { StoryCard } from '../index';

export function Stories() {
  return (
    <div className={styles.stories}>
      <ul className={styles.storiesList}>
        <StoryCard toState='usage' image='./assets/satellite-1.jpg'>
          Why do we need satellites?
        </StoryCard>
        <StoryCard toState='orbits' image='./assets/satellite-2.jpg'>
          What is the altitude of a satellite?
        </StoryCard>
      </ul>
    </div>
  );
}
