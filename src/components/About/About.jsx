import * as styles from './About.module.css';
import appStore from '../../stores/AppStore';

export function About() {
  function close() {
    appStore.setDisplayAbout(false);
  }
  return (
    <>
      <div className={styles.menuContainer}>
        <button className={styles.closeButton} onClick={close}>
          <img src='./assets/close.svg'></img>
        </button>
        <div>
          Application developed by Esri's GeoExperience Center.
          <h2>Technologies</h2>
          <p>
            <a href='https://developers.arcgis.com/javascript/latest/' target='_blank'>
              ArcGIS API for JavaScript
            </a>{' '}
            for 3D visualization
          </p>
          <h2>Data</h2>
          <p>
            Metadata for active satellites from the{' '}
            <a href='https://www.ucsusa.org/resources/satellite-database'>
              Union of Concerned Scientists Satellite Database
            </a>
            .
          </p>
          <p>
            Latest Two Line Element (TLE) files for active satellites from{' '}
            <a href='https://celestrak.com/NORAD/elements/active.txt'>CelesTrack</a>.
          </p>
        </div>
      </div>
    </>
  );
}
