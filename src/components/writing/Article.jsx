import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../../articles';
import { calculateReadingTime } from '../../utils/readingTime';
import './Writing.scss';
import WritingNavHeader from './WritingNavHeader';

const ARTICLE_STAGGER_S = 0.038;

const Article = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);
  const articleRef = useRef(null);

  useLayoutEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const applyReveal = () => {
      const blocks = [...root.querySelectorAll(':scope > *')];
      let visibleOrder = 0;
      for (const el of blocks) {
        const { bottom } = el.getBoundingClientRect();
        const fullyAboveViewport = bottom <= 0;
        el.classList.toggle('article-reveal-skip', fullyAboveViewport);
        if (fullyAboveViewport) {
          el.style.removeProperty('--reveal-delay');
        } else {
          el.style.setProperty('--reveal-delay', `${visibleOrder * ARTICLE_STAGGER_S}s`);
          visibleOrder += 1;
        }
      }
    };

    applyReveal();
    const t = window.setTimeout(applyReveal, 0);
    return () => window.clearTimeout(t);
  }, [slug]);

  // Calculate reading time based on content
  const readingTime = useMemo(() => {
    if (!article) return 0;
    return calculateReadingTime(article.content);
  }, [article]);

  if (!article) {
    return (
      <>
        <WritingNavHeader />
        <div className="writing-page">
        <h2>Article not found</h2>
        <Link to="/writing">← Back to Writing</Link>
      </div>
      </>
    );
  }

  return (
    <>
      <WritingNavHeader />
      <div className="writing-page">
      <article ref={articleRef}>
        <h1>{article.title}</h1>
        <div className="article-meta">
          <p className="date">{article.date}</p>
          <span className="reading-time">• {readingTime} {readingTime === 1 ? 'min' : 'mins'}</span>
        </div>
        {article.content}
      </article>
      </div>
    </>
  );
};

export default Article;
