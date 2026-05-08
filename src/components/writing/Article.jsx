import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../../articles';
import { calculateReadingTime } from '../../utils/readingTime';
import './Writing.scss';
import WritingNavHeader from './WritingNavHeader';

const BASE_STAGGER_S = 0.038;
const MIN_STAGGER_S = 0.014;
const MAX_TAIL_STAGGER_S = 1.12;
const BASE_FADE_S = 0.45;
const MIN_FADE_S = 0.36;
const FADE_PER_BLOCK_S = 0.00058;

const Article = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);
  const articleRef = useRef(null);

  useLayoutEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const applyReveal = () => {
      const blocks = [...root.querySelectorAll(':scope > *')];
      const blockCount = Math.max(blocks.length, 1);
      const stagger = Math.min(
        BASE_STAGGER_S,
        Math.max(MIN_STAGGER_S, MAX_TAIL_STAGGER_S / blockCount)
      );
      const fadeSeconds = Math.max(
        MIN_FADE_S,
        Math.min(BASE_FADE_S, BASE_FADE_S + 0.04 - blockCount * FADE_PER_BLOCK_S)
      );
      root.style.setProperty('--article-fade-duration', `${fadeSeconds}s`);

      let visibleOrder = 0;
      for (const el of blocks) {
        const { bottom } = el.getBoundingClientRect();
        const fullyAboveViewport = bottom <= 0;
        el.classList.toggle('article-reveal-skip', fullyAboveViewport);
        if (fullyAboveViewport) {
          el.style.removeProperty('--reveal-delay');
        } else {
          el.style.setProperty('--reveal-delay', `${visibleOrder * stagger}s`);
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
      <div className="writing-route">
        <WritingNavHeader />
        <div className="writing-page">
          <h2>Article not found</h2>
          <Link to="/writing">← Back to Writing</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="writing-route">
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
    </div>
  );
};

export default Article;
