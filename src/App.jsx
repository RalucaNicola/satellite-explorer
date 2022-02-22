import { Map } from './components/Map';
import { Loading } from './components/Loading';
import appStore from './stores/AppStore';
import { observer } from 'mobx-react';

const App = observer(() => {
  return (
    <>
      <Map map={appStore.map}></Map>
      {!appStore.viewIsReady && <Loading></Loading>}
    </>
  );
});

export default App;
