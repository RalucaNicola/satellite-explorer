import * as styles from './App.module.css';
import { useState } from 'react';
import { Menu } from '../Menu';
import { Map } from '../Map';
import { DataProvider } from '../DataProvider';

export function App() {
  return (
    <DataProvider>
      <Map></Map>
      <Menu></Menu>
    </DataProvider>
  );
}
