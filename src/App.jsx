import { Home } from './components/Home';
import { Loading } from './components/Loading';
import { Stories } from './components/Stories';
import { PageNotFound } from './components/PageNotFound';
import appStore from './stores/AppStore';
import { observer } from 'mobx-react';

import { Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { SatelliteUsage } from './components/SatelliteUsage';
import { SatelliteNumber } from './components/SatelliteNumber';
import { SatelliteOrbits } from './components/SatelliteOrbits';
import { Search } from './components/Search';
import { Satellite } from './components/Satellite';

const App = observer(() => {
  let location = useLocation();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    appStore.setLocation(location.pathname);
  }, [location]);
  useEffect(() => {
    appStore.setSearchString(searchParams.get('filter'));
  }, [searchParams]);

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />}>
          <Route path='*' element={<PageNotFound />} />
          <Route index element={<Stories />} />
          <Route path='satellite-usage' element={<SatelliteUsage />} />
          <Route path='satellite-number' element={<SatelliteNumber />} />
          <Route path='satellite-orbits' element={<SatelliteOrbits />} />
          <Route path='search' element={<Search />}></Route>
          <Route path=':noradID' element={<Satellite />} />
        </Route>
      </Routes>
      {!appStore.viewIsReady && <Loading></Loading>}
    </>
  );
});

export default App;
