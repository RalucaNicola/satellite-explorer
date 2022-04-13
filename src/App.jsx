import {
  Map,
  Loading,
  Menu,
  Stories,
  SatelliteUsage,
  SatelliteOrbits,
  SatelliteOwners,
  Debris,
  Search,
  Satellite,
  About
} from './components';
import { parseHash } from './utils/urlUtils';
import appStore from './stores/AppStore';
import dataStore from './stores/DataStore';
import satelliteStore from './stores/SatelliteStore';
import { observer } from 'mobx-react';
import { useEffect } from 'react';

const App = observer(() => {
  useEffect(() => {
    const hashParams = parseHash();
    if (hashParams.hasOwnProperty('norad')) {
      appStore.setActiveState('satellite');
      const satellite = dataStore.getSatelliteById(hashParams.norad);
      satelliteStore.setSelectedSatellite(satellite);
    } else {
      appStore.setActiveState('general');
    }
  }, []);

  return (
    <>
      <Map></Map>
      <Menu></Menu>
      {appStore.activeState === 'general' && <Stories />}
      {appStore.activeState === 'usage' && <SatelliteUsage />}
      {appStore.activeState === 'orbits' && <SatelliteOrbits />}
      {appStore.activeState === 'debris' && <Debris />}
      {appStore.activeState === 'search' && <Search />}
      {appStore.activeState === 'satellite' && <Satellite />}
      {appStore.activeState === 'owners' && <SatelliteOwners />}
      {appStore.isLoading && <Loading></Loading>}
      {appStore.displayAbout && <About />}
    </>
  );
});

export default App;
