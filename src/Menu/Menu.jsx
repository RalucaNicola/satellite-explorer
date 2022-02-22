import * as styles from './Menu.module.css';
import { useState } from 'react';
import { OrbitCard } from '../OrbitCard';
import { OrbitPanel } from '../OrbitPanel';

export function Menu() {
  // main, low, medium
  const [openPanel, setOpenPanel] = useState('main');

  function showPanel(event, type) {
    setOpenPanel(type);
  }
  console.log(openPanel);
  switch (openPanel) {
    case 'main':
      return (
        <div className={styles.menu}>
          <h1>Satellite Explorer</h1>
          <OrbitCard onClick={(e) => showPanel(e, 'low')} type='leo' imgSource='./assets/low-orbit.png'>
            <h2>Low earth orbit</h2>
            <p>
              300km to 2,000km up is the closest safe orbit for satellites, home to famous names including the Hubble
              Space Telescope and the International Space Station (ISS)
            </p>
          </OrbitCard>
          <OrbitCard onClick={(e) => showPanel(e, 'medium')} type='meo' imgSource='./assets/medium-orbit.png'>
            <h2>Medium earth orbit</h2>
            <p>
              300km to 2,000km up is the closest safe orbit for satellites, home to famous names including the Hubble
              Space Telescope and the International Space Station (ISS)
            </p>
          </OrbitCard>
        </div>
      );
    default:
      return (
        <div className={styles.menu}>
          <h1>Satellite Explorer</h1>
          <OrbitPanel type={openPanel} showPanel={showPanel}></OrbitPanel>
        </div>
      );
  }
}
