import * as styles from './BackButton.module.css';
import { useNavigate } from 'react-router-dom';

export function BackButton({ navigateTo = -1 }) {
  const navigate = useNavigate();
  return (
    <button
      className={styles.backButton}
      onClick={() => {
        navigate(navigateTo);
      }}
    ></button>
  );
}
