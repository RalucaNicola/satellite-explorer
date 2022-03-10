import { Outlet } from 'react-router-dom';
import { Map, Menu } from '../index';

export const Home = () => {
  return (
    <>
      <Map></Map>
      <Outlet />
      <Menu></Menu>
    </>
  );
};
