import appStore from '../../stores/AppStore';
import * as styles from './BackButton.module.css';

export function BackButton({ toState, onClick }) {
  return (
    <button
      className={styles.backButton}
      onClick={() => {
        if (toState) {
          appStore.setActiveState(toState);
        } else if (appStore.previousState) {
          appStore.setActiveState(appStore.previousState);
        } else {
          appStore.setActiveState('general');
        }

        if (onClick) {
          onClick();
        }
      }}
    >
      <img src='./assets/arrows-back.svg' className={styles.backImage}></img>
    </button>
  );
}
