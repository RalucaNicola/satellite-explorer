import * as styles from './Accordion.module.css';
import { useState } from 'react';

export function Accordion({ children, title }) {
  const [active, setActive] = useState(false);
  function toggleActive() {
    setActive(!active);
  }
  return (
    <div className={styles.accordionPanel}>
      <button className={`${styles.accordionButton} ${active ? styles.active : ''}`} onClick={toggleActive}>
        {title}
        <img className={styles.buttonImage} src='./assets/arrows-dropdown.svg'></img>
      </button>
      <div className={`${styles.accordionContent} ${active ? styles.show : styles.hide}`}>{children}</div>
    </div>
  );
}
