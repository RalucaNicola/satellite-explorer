import * as styles from './OrbitCard.module.css';

export function OrbitCard({ onClick, imgSource, children }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.leftCard}>
        <img src={imgSource}></img>
      </div>
      <div className={styles.rightCard}>{children}</div>
    </div>
  );
}
