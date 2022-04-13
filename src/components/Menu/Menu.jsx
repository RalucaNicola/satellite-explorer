import * as styles from './Menu.module.css';

import { useEffect, useState } from 'react';
import { Link } from '../index';
import appStore from '../../stores/AppStore';

export const Menu = () => {
  const [active, setActive] = useState();
  const toggleMenu = () => {
    setActive(!active);
  };
  return (
    <>
      <div className={styles.menu}>
        <div className={styles.title}>
          <Link toState='general'>SatelliteExplorer</Link>
        </div>
        <button onClick={toggleMenu} className={styles.mobileMenuButton}>
          <svg width='50px' height='25px'>
            <line className={styles.menuLine} x1='1.5' y1='1.5' x2='36.5' y2='1.5' />
            <line className={styles.menuLine} x1='1.5' y1='12.5' x2='36.5' y2='12.5' />
            <line className={`${styles.menuLine} ${styles.animatedLine}`} x1='1.5' y1='23.5' x2='36.5' y2='23.5' />
          </svg>
        </button>
        <div className={styles.desktopMenuContainer}>
          <ul className={styles.desktopMenuList}>
            <li></li>
            <li>
              <Link toState='search'>Search</Link>
            </li>
            <li>
              <Link
                onClick={() => {
                  appStore.setDisplayAbout(true);
                }}
              >
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.mobileMenuContainer} style={{ display: active ? 'block' : 'none' }}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          <img src='./assets/close.svg'></img>
        </button>
        <ul className={styles.mobileMenuList}>
          <li>
            <Link toState='general' onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link toState='search' onClick={toggleMenu}>
              Search
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
    </>
  );
};
