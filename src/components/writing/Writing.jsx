import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { articles } from '../../articles';
import { SHOW_TIER_LIST } from '../../constants/siteFlags';
import './Writing.scss';

const Writing = () => {
  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isDraftsActive = location.pathname.startsWith('/drafts');
  
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        // Always show header near the top
        setHeaderVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="writing-page">
      <div className={`writing-header ${!headerVisible ? 'header-hidden' : ''}`}>
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
        {SHOW_TIER_LIST && (
          <Link 
            to="/tier-list" 
            className={`header-option ${location.pathname === '/tier-list' ? 'active' : ''}`}
          >
            Tier List
          </Link>
        )}
      </div>
      <h1>Drafts</h1>
      <div className="articles-list">
      {articles.map((article) => (
        <Link 
          key={article.id} 
          to={`/drafts/${article.slug}`}
          className="article-link"
        >
          <div className="article-preview">
            <div className="article-header">
              <p>{article.title}</p>
              <span className="date">{article.date}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
  );
};

export default Writing;
