import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './writing/Writing.scss';

const Taste = () => {
  const location = useLocation();
  const isTasteActive = location.pathname === '/taste';
  const isHomeActive = location.pathname === '/';
  const isDraftsActive = location.pathname.startsWith('/drafts');

  return (
    <div className="writing-page">
      <div className="writing-header">
        <Link 
          to="/" 
          className={`header-option ${isHomeActive ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/drafts" 
          className={`header-option ${isDraftsActive ? 'active' : ''}`}
        >
          Drafts
        </Link>
        <Link 
          to="/taste" 
          className={`header-option ${isTasteActive ? 'active' : ''}`}
        >
          Taste
        </Link>
      </div>
      <h1>Taste</h1>
      <p>Coming soon...</p>
    </div>
  );
};

export default Taste;

