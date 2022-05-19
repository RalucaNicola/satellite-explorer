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
      <h2>What is space debris?</h2>
      <div className={styles.block}>
        <p>
          Space debris represents defunct artificial objects in space which no longer serve a useful function. The
          debris is composed of old satellites, abandoned launch vehicle stages, mission-related debris, and
          fragmentation debris.
        </p>
        <h3>How much space debris is out there?</h3>
        <p>
          It's not possible to track all the debris objects. According to{' '}
          <a
            className='link'
            href='https://www.esa.int/Safety_Security/Space_Debris/Space_debris_by_the_numbers'
            target='_blank'
          >
            an European Space Agency article
          </a>{' '}
          there are around:
        </p>
        <p className={styles.alignCenter}>
          <span className={styles.large}>36,500</span> pieces of debris <br />
          larger than 10 cm/4 inches
        </p>
        <p className={styles.alignCenter}>
          <span className={styles.large}>1,000,000</span> pieces of debris <br />
          larger than 1 cm/0.4 inches
        </p>
        <p className={styles.alignCenter}>
          <span className={styles.large}>130 million</span> pieces of debris <br /> about 1 mm/0.04 inches and larger
        </p>
        These objects travel at speeds up to 28,160 kph/17,500 mph so even if they are very small they can damage a
        spacecraft when travelling at these speeds.
      </div>
      <div className={styles.block}>
        <h3>Collisions in space</h3>
        <p>
          Satellite operators frequently maneuver their satellites to avoid potential collisions with debris fragments.
          There have been several prominent space collisions, whose fragments are displayed on the map (their positions
          are predicted as of March 28th, 2022). The collision in 2009 was accidental and the others were triggered on
          purpose by{' '}
          <a className='link' href='https://en.wikipedia.org/wiki/Anti-satellite_weapon' target='_blank'>
            anti-satellite weapons
          </a>
          .
        </p>
        <ul>
          <li>
            <p className={styles.collisionTitle}>2021</p>
            <div className={styles.collisionContent}>
              <span className={`${styles.collisionLegend} ${styles.blue}`}> Cosmos 1408</span> satellite was destroyed
              in a Russian anti-satellite weapon test on November 15, 2021, resulting in space debris in orbits between
              300 km/190 mi and 1,100 km/680 mi above the Earth. The threat of potential collision with debris caused
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
              On February 10, 2009, <span className={`${styles.collisionLegend} ${styles.green}`}> Cosmos 2251</span> a
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
                  Chinese anti-satellite test fragments
                </FilterButton>
              </div>
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
        <h3>Who cleans up outer space?</h3>
        <p>
          Space debris poses a real challenge in the future, especially with the rise of megaconstellations. Space
          organizations and companies compete for innovative solutions to clean up debris and make outer space safer.
          Below are some examples of projects in development that use various technologies to clean up space:
        </p>
        <h4>Izaña-1 laser ranging station</h4>
        <p>
          The European Space Agency is testing a new laser ranging station in Tenerife, Spain. Using powerful lasers
          they can rapidly determine the location, velocity and orbit of previously invisible defunct objects. They can
          also gently nudge debris objects into new orbit to avoid collision. Read more about this technology on the{' '}
          <a
            className='link'
            href='https://www.esa.int/Safety_Security/Space_Debris/New_laser_station_lights_the_way_to_debris_reduction'
            target='_blank'
          >
            ESA website
          </a>
          .
        </p>
        <h4>Mission ClearSpace-1</h4>{' '}
        <p>
          The mission, planned for 2025, will use a four-armed robot to capture a Vega Secondary Payload Adapter, left
          behind by ESA's Vega launcher in 2013. This is a partnership between the{' '}
          <a
            className='link'
            href='https://www.esa.int/Safety_Security/Clean_Space/ESA_commissions_world_s_first_space_debris_removal'
            target='_blank'
          >
            European Space Agency
          </a>{' '}
          and{' '}
          <a className='link' href='https://clearspace.today/' target='_blank'>
            ClearSpace
          </a>
          , a Swiss based start-up.
        </p>
        <h4>ELSA spacecraft retrieval service</h4>
        <p>
          The idea of the program is to launch two spacecrafts - a servicer satellite and a client satellite - to track
          down and dock dead satellites and remove them from the orbit. Astroscale, the Japanese-based company behind
          the mission successfully carried tests in 2021 where they did multiple dockings and releasing of satellite
          targets. In 2022 they experienced difficulties with the test program. Read more about{' '}
          <a className='link' href='https://astroscale.com/missions/elsa-d/' target='_blank'>
            the mission on their website
          </a>
          .
        </p>
        <h4>E-Space</h4>
        <p>
          <a className='link' href='https://www.e-space.com/news' target='_blank'>
            E-Space
          </a>{' '}
          is a startup that plans to launch a network of satellites that would capture pieces of debris while in orbit.
          Once they have captured a set amount of debris they are programmed to de-orbit and burn up in the atmosphere.
          The first three test satellites will be launched later in 2022.
        </p>
      </div>
      <BackButton toState='general'></BackButton>
    </InfoPanel>
  );
};
