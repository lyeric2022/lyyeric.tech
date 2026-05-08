import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SHOW_TIER_LIST } from '../../constants/siteFlags';

const WritingNavHeader = () => {
  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isWritingActive = location.pathname.startsWith('/writing');

  return (
    <div className="writing-header">
      <Link to="/" className={`header-option ${isHomeActive ? 'active' : ''}`}>
        Home
      </Link>
      <Link to="/writing" className={`header-option ${isWritingActive ? 'active' : ''}`}>
        Writing
      </Link>
      {SHOW_TIER_LIST && (
        <Link
          to="/tier-list"
          className={`header-option ${location.pathname === '/tier-list' ? 'active' : ''}`}
        >
          Tier List
        </Link>
      )}
    </div>
  );
};

export default WritingNavHeader;
