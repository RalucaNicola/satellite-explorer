import * as styles from './Stories.module.css';
import { StoryCard } from '../StoryCard';

export function Stories() {
  return (
    <div className={styles.menu}>
      <ul className={styles.storiesList}>
        <StoryCard link='satellite-usage' image='./assets/satellite-1.jpg'>
          Why do we need satellites?
        </StoryCard>
        <StoryCard link='satellite-number' image='./assets/satellite-2.jpg'>
          How many satellites are out there?
        </StoryCard>
        <StoryCard link='satellite-internet' image='./assets/satellite-2.jpg'>
          Internet for everyone, everywhere?
        </StoryCard>
        <StoryCard link='coming-soon' image='./assets/satellite-2.jpg'>
          A space junk crisis?
        </StoryCard>
        <StoryCard link='coming-soon' image='./assets/satellite-2.jpg'>
          Who owns the satellites?
        </StoryCard>
        <StoryCard link='coming-soon' image='./assets/satellite-2.jpg'>
          The International Space Station
        </StoryCard>
      </ul>
    </div>
  );
}
