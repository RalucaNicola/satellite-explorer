import * as styles from './App.module.css';
import { useState } from 'react';
import { Menu } from '../Menu';
import { Map } from '../Map';

export function App() {
  return (
    <>
      <Map></Map>
      <Menu></Menu>
    </>
  );
}
