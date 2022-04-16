import * as styles from './Debris.module.css';
import { BackButton, FilterButton, InfoPanel } from '../index';
import mapStore from '../../stores/MapStore';
import { useEffect, useState } from 'react';

export const Debris = () => {
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    mapStore.setVisualizationType('debris');
    mapStore.goToPosition('debris');
    return () => {
      mapStore.filterSpaceDebris('all');
    };
  }, []);

  const handleFilter = ({ filter }) => {
    if (filter === 'all') {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
    mapStore.filterSpaceDebris(filter);
  };
  return (
    <InfoPanel>
      <BackButton toState='general'></BackButton>
      <h2>A space debris crisis?</h2>
      <div className={styles.block}>
        <p>
          Space debris represents defunct artificial objects in space — principally in low Earth orbit — which no longer
          serve a useful function. Such debris includes derelict satellites, abandoned launch vehicle stages,
          mission-related debris, and fragmentation debris.
        </p>
        <h3>How much space debris is out there?</h3>
        <p className={styles.alignCenter}>
          <span className={styles.large}>36,500</span> pieces of debris <br />
          larger than 4 inches/10 cm.
        </p>
        <p className={styles.alignCenter}>
          <span className={styles.large}>1,000,000</span> pieces of debris <br />
          larger than 0.4 inches/1 cm.
        </p>
        <p className={styles.alignCenter}>
          <span className={styles.large}>130 million</span> pieces of debris <br /> about 0.04 inches/1mm and larger.
        </p>
        These objects travel at speeds up to 17,500mph / 28,160kph so even if they are very small they can damage a
        spacecraft when travelling at these speeds.
      </div>
      <div className={styles.block}>
        <h3>Collisions in space</h3>
        <p>
          The globe displays the fragments from the most prominent space collisions as of March 28th, 2022. Some are
          accidental, like the one in 2009 and 1996 and others are caused by{' '}
          <a href='https://en.wikipedia.org/wiki/Anti-satellite_weapon' target='_blank'>
            anti-satellite weapons
          </a>
          .
        </p>
        <ul>
          <li>
            <p className={styles.collisionTitle}>2021</p>
            <div className={styles.collisionContent}>
              <span className={`${styles.collisionLegend} ${styles.blue}`}> Cosmos 1408</span> satellite was destroyed
              in a Russian anti-satellite weapon test on 15 November 2021, resulting in space debris in orbits between
              300 and 1,100 km (190 and 680 mi) above the Earth. The threat of potential collision with debris caused
              the crew of the International Space Station (ISS) to take shelter in their escape capsules for the first
              few passes of the debris cloud, and increased the future risk of a debris collision with the ISS or other
              satellites.
              <div style={{ textAlign: 'center' }}>
                <FilterButton
                  filter='russian-antitest'
                  active={activeFilter === 'russian-antitest'}
                  clickHandler={handleFilter}
                >
                  Russian anti-satellite test fragments
                </FilterButton>
              </div>
            </div>
          </li>
          <li>
            <p className={styles.collisionTitle}>2009</p>
            <div className={styles.collisionContent}>
              On Feb. 10, 2009, <span className={`${styles.collisionLegend} ${styles.green}`}> Cosmos 2251</span> a
              defunct Russian spacecraft collided with and destroyed{' '}
              <span className={`${styles.collisionLegend} ${styles.yellow}`}> Iridium 33</span> a functioning U.S.
              Iridium commercial spacecraft. The collision added more than 2,300 pieces of large, trackable debris and
              many more smaller debris into space.
              <div style={{ textAlign: 'center' }}>
                <FilterButton filter='cosmos' active={activeFilter === 'cosmos'} clickHandler={handleFilter}>
                  Fragments from the Iridium - Cosmos collision
                </FilterButton>
              </div>
            </div>
          </li>
          <li>
            <p className={styles.collisionTitle}>2007</p>
            <div className={styles.collisionContent}>
              China's 2007 anti-satellite test, which used a missile to destroy{' '}
              <span className={`${styles.collisionLegend} ${styles.orange}`}> Fengyun 1C</span> an old weather
              satellite, added more than 3,500 pieces of large, trackable debris and many more smaller debris into
              space.
              <div style={{ textAlign: 'center' }}>
                <FilterButton
                  filter='chinese-antitest'
                  active={activeFilter === 'chinese-antitest'}
                  clickHandler={handleFilter}
                >
                  Filter anti-satellite test fragments
                </FilterButton>
              </div>
            </div>
          </li>
          <li>
            <p className={styles.collisionTitle}>1996</p>
            <div className={styles.collisionContent}>
              In 1996, a French satellite was hit and damaged by debris from a French rocket that had exploded a decade
              earlier.
            </div>
          </li>
        </ul>{' '}
        <div style={{ textAlign: 'center' }}>
          <FilterButton filter='all' clickHandler={handleFilter}>
            Remove filters
          </FilterButton>
        </div>
      </div>
      <div className={styles.block}>
        <h3>Who cleans up the space?</h3>
        <p>ESpace - a company plans to release 100,000 satellites to capture debris. </p>
        <p>ESA using lasers to push satellites out of orbit, avoid collision, track space debris.</p>
        <p>Privateer - Steve Wozniak's startup plans to launch hundreds of satellites to study space debris.</p>
      </div>
      <BackButton toState='general'></BackButton>
    </InfoPanel>
  );
};
