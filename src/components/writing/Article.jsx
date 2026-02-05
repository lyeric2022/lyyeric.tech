import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { articles } from '../../articles';
import { calculateReadingTime } from '../../utils/readingTime';
import { SHOW_TIER_LIST } from '../../constants/siteFlags';
import './Writing.scss';

const Article = () => {
  const { slug } = useParams();
  const location = useLocation();
  const article = articles.find(a => a.slug === slug);
  const isHomeActive = location.pathname === '/';
  const isDraftsActive = location.pathname.startsWith('/drafts');

  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setHeaderVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Calculate reading time based on content
  const readingTime = useMemo(() => {
    if (!article) return 0;
    return calculateReadingTime(article.content);
  }, [article]);

  if (!article) {
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
        <h2>Article not found</h2>
        <Link to="/drafts">← Back to Drafts</Link>
      </div>
    );
  }

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
      <article>
        <h1>{article.title}</h1>
        <div className="article-meta">
          <p className="date">{article.date}</p>
          <span className="reading-time">• {readingTime} {readingTime === 1 ? 'min' : 'mins'}</span>
        </div>
        {article.content}
      </article>
    </div>
  );
};

export default Article;
