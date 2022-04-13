import * as styles from './InfoPanel.module.css';

export function InfoPanel({ children }) {
  return (
    <div className={styles.panel}>
      <div className={styles.scroller}>{children}</div>
    </div>
  );
}
