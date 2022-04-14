import * as styles from './Title.module.css';
import { Link } from '../index';

export function Title({ isLoading }) {
  return (
    <div className={`${styles.title} ${!isLoading ? styles.left : ''}`}>
      <Link toState='general'>
        Satellite<span>X</span>plorer
      </Link>
    </div>
  );
}
