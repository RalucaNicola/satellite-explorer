import * as styles from './App.module.css';
import { useState } from 'react';
import { Menu } from '../Menu';
import { Map } from '../Map';
import { DataProvider } from '../DataProvider';
import { AppStateProvider } from '../AppState';

export function App() {
  return (
    <DataProvider>
      <AppStateProvider>
        <Map></Map>
        <Menu></Menu>
      </AppStateProvider>
    </DataProvider>
  );
}
