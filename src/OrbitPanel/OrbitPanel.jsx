import * as styles from './OrbitPanel.module.css';

export function OrbitPanel({ showPanel, type }) {
  return (
    <>
      <div>this is a {type} panel</div>
      <button onClick={(e) => showPanel(e, 'main')}>Back</button>
    </>
  );
}
