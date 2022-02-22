import { createContext, useContext, useReducer } from 'react';

/**
 * @property {'loading' | 'loaded' | 'error'} dataStatus
 * @property {'loading' | 'loaded' | 'error'} mapStatus
 * @property {'leo' | 'meo' | 'none'} filter
 */
const defaultState = {
  dataStatus: 'loading',
  mapStatus: 'loading',
  filter: 'none'
};

const AppState = createContext(undefined);

const mainReducer = (state, action) => {
  switch (action.type) {
    case 'DATA_STATUS':
      console.log('data status changed');
      return { ...state, dataStatus: action.payload };
    case 'MAP_STATUS':
      console.log('map status changed');
      return { ...state, mapStatus: action.payload };
    case 'FILTER':
      console.log('filter was triggered', action.payload);
      return { ...state, filter: action.payload };
    default:
      throw new Error('Invalid action');
  }
};

const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, defaultState);
  return <AppState.Provider value={{ state, dispatch }}>{children}</AppState.Provider>;
};

function useAppState() {
  const context = useContext(AppState);
  if (context === undefined) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }
  return context;
}

export { AppStateProvider, useAppState };
