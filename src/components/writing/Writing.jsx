import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { articles } from '../../articles';
import './Writing.scss';

const Writing = () => {
  const location = useLocation();
  const isTierListActive = location.pathname === '/tier-list';
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
          to="/tier-list" 
          className={`header-option ${isTierListActive ? 'active' : ''}`}
        >
          Tier List
        </Link>
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
