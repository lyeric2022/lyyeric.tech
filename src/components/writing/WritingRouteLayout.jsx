import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavChromeMotionContext } from '../../context/NavChromeMotionContext';
import WritingNavHeader from './WritingNavHeader';
import './Writing.scss';

/** Keeps `<WritingNavHeader />` mounted across `/`, Writing, Article, Rankings so dot indicator transitions stay stable (same DOM as Essays/Drafts). Hidden on v1 home (legacy layout). */
export default function WritingRouteLayout() {
  const { viewMode } = useContext(NavChromeMotionContext);
  const { pathname } = useLocation();
  const showSiteNav = !(viewMode === 'v1' && pathname === '/');

  return (
    <div className="writing-route">
      {showSiteNav && <WritingNavHeader />}
      <Outlet />
    </div>
  );
}
