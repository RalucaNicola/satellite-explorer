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
        <div className={styles.article}>
          <div className={styles.block}>
            <h2 className={styles.title}>Technologies</h2>
            <p>
              3D visualization with{' '}
              <a className='link' href='https://developers.arcgis.com/javascript/latest/' target='_blank'>
                ArcGIS API for JavaScript
              </a>
              . UI development with{' '}
              <a className='link' href='https://reactjs.org/' target='_blank'>
                React
              </a>
              ,{' '}
              <a className='link' href='https://mobx.js.org/README.html' target='_blank'>
                MobX
              </a>
              . Poppins font from{' '}
              <a className='link' href='https://fonts.google.com/specimen/Poppins' target='_blank'>
                Google Fonts
              </a>
              .
            </p>
          </div>
          <div className={styles.block}>
            <h2 className={styles.title}>Data</h2>
            <p>
              Firefly basemap by{' '}
              <a className='link' href='https://www.esri.com/arcgis-blog/author/j_nelson/' target='_blank'>
                John Nelson
              </a>
              . Basemap data providers: Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN,
              and the GIS User Community.
            </p>
            <p>
              Metadata for active satellites from the{' '}
              <a className='link' href='https://www.ucsusa.org/resources/satellite-database' target='_blank'>
                Union of Concerned Scientists Satellite Database
              </a>
              .
            </p>
            <p>
              Two Line Element (TLE) files for active satellites from{' '}
              <a className='link' href='https://celestrak.com/NORAD/elements/active.txt' target='_blank'>
                CelesTrack
              </a>
              .
            </p>
            <p>
              <a className='link' href='https://github.com/shashwatak/satellite-js' target='_blank'>
                Satellite.js
              </a>{' '}
              to calculate the satellite position and orbits.
            </p>
          </div>
          <div className={styles.block}>
            <h2 className={styles.title}>Assets</h2>
            <p>tbd</p>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>
            Application developed by the{' '}
            <a className='link' href='https://esriis.sharepoint.com/sites/GeoXC' target='_blank'>
              Geo Experience Center
            </a>{' '}
            at{' '}
            <a className='link' href='https://www.esri.com' target='_blank'>
              Esri
            </a>
            .
          </p>
          <img src='./assets/GeoXC-logo.png' className={styles.logoGeoxc}></img>
          <img src='./assets/esri-logo.png' className={styles.logoEsri}></img>
        </footer>
      </div>
    </>
  );
}
