import * as styles from './SpaceJunk.module.css';
import { BackButton } from '../index';

export const SpaceJunk = () => {
  return (
    <div className={styles.menu}>
      <BackButton toState='general'></BackButton>
      <h2>A space junk crisis?</h2>
      <div className={styles.block}>
        <p>
          Space junk represents defunct artificial objects in space — principally in low Earth orbit — which no longer
          serve a useful function. Such debris includes derelict satellites, abandoned launch vehicle stages,
          mission-related debris, and fragmentation debris.
        </p>
        <h3>How much space debris is out there?</h3>
        <p>
          <span className={styles.large}>36,500</span> pieces of debris larger than 4 inches or 10cm orbiting the Earth.{' '}
        </p>
        <p>
          <span className={styles.large}>1,000,000</span> pieces of debris the size of a marble or larger (up to 0.4
          inches, or 1 centimeter).{' '}
        </p>
        <p>
          <span className={styles.large}>130 million</span> pieces of debris about .04 inches (or one millimeter) and
          larger.
        </p>{' '}
        These objects travel at speeds up to 17,500mph (28,160kph) so even if they are very small they can damage a
        spacecraft when travelling at these speeds.
      </div>
      <div className={styles.block}>
        <h3>Collisions in space</h3>
        <ul>
          <li>
            In 1996, a French satellite was hit and damaged by debris from a French rocket that had exploded a decade
            earlier.{' '}
          </li>
          <li>
            On Feb. 10, 2009, a defunct Russian spacecraft collided with and destroyed a functioning U.S. Iridium
            commercial spacecraft. The collision added more than 2,300 pieces of large, trackable debris and many more
            smaller debris to the inventory of space junk.
          </li>
          <li>
            China's 2007 anti-satellite test, which used a missile to destroy an old weather satellite, added more than
            3,500 pieces of large, trackable debris and many more smaller debris to the debris problem.
          </li>
        </ul>
      </div>
      <div className={styles.block}>
        <h3>Who cleans up the space?</h3>
        <p>ESpace - a company plans to release 100,000 satellites to capture debris. </p>
        <p>ESA using lasers to push satellites out of orbit, avoid collision, track space debris.</p>
        <p>Privateer - Steve Wozniak's startup plans to launch hundreds of satellites to study space debris.</p>
      </div>
      <BackButton toState='general'></BackButton>
    </div>
  );
};
