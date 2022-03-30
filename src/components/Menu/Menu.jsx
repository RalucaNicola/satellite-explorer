import * as styles from './Menu.module.css';

import { useState } from 'react';
import { Link } from '../index';
import appStore from '../../stores/AppStore';

export const Menu = () => {
  const [active, setActive] = useState();
  const toggleMenu = () => {
    setActive(!active);
  };
  return (
    <>
      <div className={styles.menuContainer} style={{ display: active ? 'block' : 'none' }}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          <img src='./assets/close.svg'></img>
        </button>
        <ul className={styles.menuList}>
          <li>
            <Link toState='general' onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link toState='search' onClick={toggleMenu}>
              Search for satellites
            </Link>
          </li>
          <li>
            <Link
              onClick={() => {
                toggleMenu();
                appStore.setDisplayAbout(true);
              }}
            >
              About
            </Link>
          </li>
        </ul>
      </div>
      <button onClick={toggleMenu} className={styles.menuButton}>
        <svg width='50px' height='25px'>
          <line className={styles.menuLine} x1='1.5' y1='1.5' x2='36.5' y2='1.5' />
          <line className={styles.menuLine} x1='1.5' y1='12.5' x2='36.5' y2='12.5' />
          <line className={`${styles.menuLine} ${styles.animatedLine}`} x1='1.5' y1='23.5' x2='36.5' y2='23.5' />
        </svg>
      </button>
    </>
  );
};
