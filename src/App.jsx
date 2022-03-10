import { Home, Loading, Stories, PageNotFound, SatelliteUsage, SatelliteOrbits, Search, Satellite } from './components';
import appStore from './stores/AppStore';

import { observer } from 'mobx-react';
import { Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

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
          <Route index element={<Stories />} />
          <Route path='satellite-usage' element={<SatelliteUsage />} />
          <Route path='satellite-orbits' element={<SatelliteOrbits />} />
          <Route path='search' element={<Search />}></Route>
          <Route path=':noradID' element={<Satellite />} />
          <Route path='*' element={<PageNotFound />} />
        </Route>
      </Routes>
      {!appStore.viewIsReady && <Loading></Loading>}
    </>
  );
});

export default App;
