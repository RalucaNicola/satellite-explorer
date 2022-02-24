import * as styles from './Stories.module.css';
import { StoryCard } from '../StoryCard';

export function Stories() {
  return (
    <div className={styles.menu}>
      <ul className={styles.storiesList}>
        <StoryCard link='satellite-usage'>Why do we need satellites?</StoryCard>
        <StoryCard link='satellite-number'>How many satellites are out there?</StoryCard>
        <StoryCard link='satellite-internet'>Internet for everyone, everywhere?</StoryCard>
      </ul>
    </div>
  );
}
