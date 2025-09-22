// src/root/RootLayout.jsx
import { Outlet } from 'react-router-dom';
import RouteLinkManager from './RouteLinkManager';

export default function RootLayout() {
  return (
    <>
      <RouteLinkManager />
      <Outlet />
    </>
  );
}
