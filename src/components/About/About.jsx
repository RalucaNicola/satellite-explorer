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
            <h2 className={styles.title}>Basemap data</h2>
            <p>
              Firefly basemap by{' '}
              <a className='link' href='https://www.esri.com/arcgis-blog/author/j_nelson/' target='_blank'>
                John Nelson
              </a>
              . Basemap data providers: Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN,
              and the GIS User Community.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Satellite data</h2>
            <p>
              The rich metadata for the active satellites is derived from the{' '}
              <a className='link' href='https://www.ucsusa.org/resources/satellite-database' target='_blank'>
                Union of Concerned Scientists Satellite Database
              </a>
              . This dataset was updated last on January 1, 2022. The metadata is merged with two line element (TLE)
              data for active satellites from{' '}
              <a className='link' href='https://celestrak.com/NORAD/elements/active.txt' target='_blank'>
                CelesTrack
              </a>{' '}
              based on the <a href='https://en.wikipedia.org/wiki/Satellite_Catalog_Number'>NORAD number</a>. Around 300
              satellites could not be matched to TLE data and are therefore not displayed in the application.
            </p>
            <p>
              The computations for orbits and satellite positions are made using{' '}
              <a className='link' href='https://github.com/shashwatak/satellite-js' target='_blank'>
                Satellite.js
              </a>{' '}
              .
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
