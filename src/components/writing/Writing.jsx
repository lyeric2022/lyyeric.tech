import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { articles } from '../../articles';
import './Writing.scss';

const Writing = () => {
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
