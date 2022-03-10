import appStore from '../../stores/AppStore';
import * as styles from './BackButton.module.css';

export function BackButton({ toState, onClick }) {
  return (
    <button
      className={styles.backButton}
      onClick={() => {
        appStore.setActiveState(toState);
        if (onClick) {
          onClick();
        }
      }}
    >
      <img src='./assets/arrows-back.svg' className={styles.backImage}></img>
    </button>
  );
}
