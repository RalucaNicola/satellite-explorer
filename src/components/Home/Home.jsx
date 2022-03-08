import { Outlet } from 'react-router-dom';
import { Map } from '../Map';
import { Menu } from '../Menu';
export const Home = () => {
  return (
    <>
      <Map></Map>
      <Outlet />
      <Menu></Menu>
    </>
  );
};
