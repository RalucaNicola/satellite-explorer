import appStore from '../../stores/AppStore';
import * as styles from './Link.module.css';

export function Link({ toState, onClick, children }) {
  return (
    <a
      className={styles.linkButton}
      onClick={() => {
        appStore.setActiveState(toState);
        if (onClick) {
          onClick();
        }
      }}
    >
      {children}
    </a>
  );
}
