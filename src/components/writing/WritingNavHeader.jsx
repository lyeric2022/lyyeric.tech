import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SHOW_RANKINGS } from '../../constants/siteFlags';
import { NavChromeMotionContext } from '../../context/NavChromeMotionContext';

const WritingNavHeader = () => {
  const location = useLocation();
  const { skipIntroFade } = useContext(NavChromeMotionContext);
  const pathname = location.pathname;
  const introClass = skipIntroFade ? 'header-option--no-intro' : '';
  const isHomeActive = pathname === '/';
  const isWritingActive = pathname.startsWith('/writing');

  return (
    <div className="writing-header">
      <Link
        to="/"
        className={`header-option ${introClass} ${isHomeActive ? 'active' : ''}`}
      >
        Home
      </Link>
      <Link
        to="/writing"
        className={`header-option ${introClass} ${isWritingActive ? 'active' : ''}`}
      >
        Writing
      </Link>
      {SHOW_RANKINGS && (
        <Link
          to="/rankings"
          className={`header-option ${introClass} ${pathname === '/rankings' ? 'active' : ''}`}
        >
          Rankings
        </Link>
      )}
    </div>
  );
};

export default WritingNavHeader;
