import { Map, Loading, Menu, Stories, SatelliteUsage, SatelliteOrbits, Search, Satellite } from './components';
import { parseHash } from './utils/utils';
import appStore from './stores/AppStore';
import { observer } from 'mobx-react';
import { useEffect } from 'react';

const App = observer(() => {
  useEffect(() => {
    if (appStore.data) {
      const hashParams = parseHash();
      if (hashParams.hasOwnProperty('norad')) {
        appStore.setActiveState('satellite');
        const satellite = appStore.getSatelliteById(hashParams.norad);
        appStore.setSelectedSatellite(satellite);
      } else {
        appStore.setActiveState('general');
      }
    }
  }, [appStore.data]);

  return (
    <>
      <Map></Map>
      {appStore.activeState === 'general' && <Stories />}
      {appStore.activeState === 'usage' && <SatelliteUsage />}
      {appStore.activeState === 'orbits' && <SatelliteOrbits />}
      {appStore.activeState === 'search' && <Search />}
      {appStore.activeState === 'satellite' && <Satellite />}
      <Menu></Menu>
      {!appStore.viewIsReady && <Loading></Loading>}
    </>
  );
});

export default App;
