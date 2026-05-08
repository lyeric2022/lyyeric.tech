import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../../articles';
import { calculateReadingTime } from '../../utils/readingTime';
import './Writing.scss';
import WritingNavHeader from './WritingNavHeader';

const formatDate = (dateStr) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [month, , year] = dateStr.split('.').map(Number);
  return `${months[month - 1]} 20${year}`;
};

const ArticleRow = ({ article }) => {
  const readingTime = calculateReadingTime(article.content);
  return (
    <Link to={`/writing/${article.slug}`} className="article-link">
      <div className="article-preview">
        <div className="article-title-row">
          <p className="article-title">{article.title}</p>
          <span className="article-date">{formatDate(article.date)}</span>
        </div>
        <span className="reading-time">{readingTime} min read</span>
      </div>
    </Link>
  );
};

const Writing = () => {
  const essays = articles.filter((a) => a.draftKind !== 'note');
  const notes = articles.filter((a) => a.draftKind === 'note');

  const [writingTab, setWritingTab] = useState(() => {
    if (typeof window === 'undefined') return 'essay';
    const savedTab = window.localStorage.getItem('writing-tab');
    return savedTab === 'note' ? 'note' : 'essay';
  });
  const activeList = writingTab === 'essay' ? essays : notes;

  const noFocus = (e) => { if (e.button === 0) e.preventDefault(); };

  useEffect(() => {
    window.localStorage.setItem('writing-tab', writingTab);
  }, [writingTab]);

  return (
    <>
      <WritingNavHeader />
      <div className="writing-page">
        <div
          className="drafts-kind-toggle"
        role="tablist"
        aria-label="Writing categories"
      >
        <button
          type="button"
          role="tab"
          id="tab-drafts-essays"
          aria-selected={writingTab === 'essay'}
          aria-controls="writing-list-panel"
          tabIndex={0}
          className={`drafts-kind-toggle__btn ${writingTab === 'essay' ? 'is-active' : ''}`}
          onMouseDown={noFocus}
          onClick={() => setWritingTab('essay')}
        >
          Essays
        </button>
        <button
          type="button"
          role="tab"
          id="tab-drafts-notes"
          aria-selected={writingTab === 'note'}
          aria-controls="writing-list-panel"
          tabIndex={0}
          className={`drafts-kind-toggle__btn ${writingTab === 'note' ? 'is-active' : ''}`}
          onMouseDown={noFocus}
          onClick={() => setWritingTab('note')}
        >
          Drafts
        </button>
      </div>

      <section
        id="writing-list-panel"
        role="tabpanel"
        aria-labelledby={writingTab === 'essay' ? 'tab-drafts-essays' : 'tab-drafts-notes'}
        className="drafts-panel"
      >
        <div key={writingTab} className="articles-list">
          {activeList.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      </section>
      </div>
    </>
  );
};

export default Writing;
