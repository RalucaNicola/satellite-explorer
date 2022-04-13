import * as styles from './Stories.module.css';
import { StoryCard } from '../index';

export function Stories() {
  return (
    <div className={styles.stories}>
      <ul className={styles.storiesList}>
        <StoryCard toState='usage' title='usage' description='Why do we need satellites?' />
        <StoryCard toState='orbits' title='orbits' description='Where are satellite orbits?' />
        <StoryCard toState='owners' title='owners' description='Who owns all the satellites?' />
        <StoryCard toState='debris' title='debris' description='A space debris crisis?' />
      </ul>
    </div>
  );
}
