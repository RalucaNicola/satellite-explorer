import * as styles from './BackButton.module.css';
import { Link } from 'react-router-dom';

export function BackButton() {
  return (
    <Link to='/' className='noUnderline'>
      <img src='./assets/arrows-back.svg' className={styles.backImage}></img>
    </Link>
  );
}
