import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { articles } from '../../articles';
import { calculateReadingTime } from '../../utils/readingTime';
import { SHOW_TIER_LIST } from '../../constants/siteFlags';
import './Writing.scss';

const formatDate = (dateStr) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [month, , year] = dateStr.split('.').map(Number);
  return `${months[month - 1]} 20${year}`;
};

const Writing = () => {
  const location = useLocation();
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
      {articles.map((article) => {
        const readingTime = calculateReadingTime(article.content);
        return (
          <Link 
            key={article.id} 
            to={`/drafts/${article.slug}`}
            className="article-link"
          >
            <div className="article-preview">
              <div className="article-title-row">
                <p className="article-title">{article.title}</p>
                <span className="article-date">{formatDate(article.date)}</span>
              </div>
              <span className="reading-time">{readingTime} min read</span>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
  );
};

export default Writing;
