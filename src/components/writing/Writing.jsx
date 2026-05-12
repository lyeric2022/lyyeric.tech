import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../../articles';
import { calculateReadingTime } from '../../utils/readingTime';
import { shouldIgnoreListPaginationArrowKeys } from '../../constants/listPagination';
import { useHeightBasedPageSize } from '../../hooks/useHeightBasedPageSize';
import { usePrevious } from '../../hooks/usePrevious';
import { slotUnderlineOrigin } from '../../utils/navUnderlineOrigin';
import './Writing.scss';

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

/** Keeps pagination vertically aligned when the last page has fewer rows than `pageSize`. */
function WritingListPadRows({ count, tabKey, page }) {
  if (count <= 0) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`writing-list-pad-${tabKey}-${page}-${i}`}
          className="article-link article-link--pad"
          aria-hidden="true"
        >
          <div className="article-preview">
            <div className="article-title-row">
              <p className="article-title">{'\u200b'}</p>
              <span className="article-date">{'\u200b'}</span>
            </div>
            <span className="reading-time">{'\u200b'}</span>
          </div>
        </div>
      ))}
    </>
  );
}

const Writing = () => {
  const essays = articles.filter((a) => a.draftKind !== 'note');
  const notes = articles.filter((a) => a.draftKind === 'note');

  const [writingTab, setWritingTab] = useState(() => {
    if (typeof window === 'undefined') return 'essay';
    const savedTab = window.localStorage.getItem('writing-tab');
    return savedTab === 'note' ? 'note' : 'essay';
  });
  const activeList = writingTab === 'essay' ? essays : notes;

  const listRef = useRef(null);
  // Reserve pagination + page bottom padding (see `.writing-page--list`). Tuned so ~one more row fits when there is visible slack without document scroll.
  const pageSize = useHeightBasedPageSize(listRef, ':scope > .article-link', {
    enabled: activeList.length > 0,
    layout: 'writing',
    bottomReserve: 108,
    deps: [writingTab, activeList.length],
  });

  const [listPage, setListPage] = useState(1);
  const [paginationIntro, setPaginationIntro] = useState(true);
  const prevWritingTabRef = useRef(writingTab);
  const prevListPageRef = useRef(listPage);
  const totalListPages = Math.max(1, Math.ceil(activeList.length / pageSize));

  useEffect(() => {
    const tabChanged = prevWritingTabRef.current !== writingTab;
    const pageChanged = prevListPageRef.current !== listPage;
    prevWritingTabRef.current = writingTab;
    prevListPageRef.current = listPage;

    if (tabChanged) {
      setPaginationIntro(true);
      return;
    }
    if (pageChanged) {
      setPaginationIntro(false);
    }
  }, [writingTab, listPage]);

  const prevTab = usePrevious(writingTab);
  const toIdx = writingTab === 'essay' ? 0 : 1;
  const fromIdx =
    prevTab === undefined ? toIdx : prevTab === 'essay' ? 0 : 1;
  const essayOrigin = slotUnderlineOrigin(fromIdx, toIdx, 0);
  const noteOrigin = slotUnderlineOrigin(fromIdx, toIdx, 1);

  const noFocus = (e) => { if (e.button === 0) e.preventDefault(); };

  useEffect(() => {
    window.localStorage.setItem('writing-tab', writingTab);
  }, [writingTab]);

  useEffect(() => {
    setListPage(1);
  }, [writingTab]);

  useEffect(() => {
    setListPage((p) => Math.min(Math.max(1, p), totalListPages));
  }, [activeList.length, totalListPages, pageSize]);

  useEffect(() => {
    if (totalListPages <= 1) return undefined;
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (shouldIgnoreListPaginationArrowKeys(e.target)) return;
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setListPage((p) => Math.max(1, p - 1));
      } else {
        e.preventDefault();
        setListPage((p) => Math.min(totalListPages, p + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [totalListPages]);

  const listOffset = (listPage - 1) * pageSize;
  const paginatedArticles = activeList.slice(listOffset, listOffset + pageSize);
  const padLinkCount =
    totalListPages > 1 ? Math.max(0, pageSize - paginatedArticles.length) : 0;

  return (
    <div className="writing-page writing-page--list">
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
          data-underline-origin={essayOrigin}
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
          data-underline-origin={noteOrigin}
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
        <div
          key={writingTab}
          ref={listRef}
          className="articles-list"
        >
          {paginatedArticles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
          <WritingListPadRows count={padLinkCount} tabKey={writingTab} page={listPage} />
        </div>
        {totalListPages > 1 && (
          <nav
            className={`list-pagination${paginationIntro ? ' list-pagination--intro' : ''}`}
            aria-label={`Writing list, page ${listPage} of ${totalListPages}`}
          >
            <div className="list-pagination__inner">
              <button
                type="button"
                className="list-pagination__btn"
                disabled={listPage <= 1}
                aria-label="Previous page"
                onClick={() => setListPage((p) => p - 1)}
              >
                Prev
              </button>
              <p className="list-pagination__meta">
                <span className="list-pagination__range">
                  {listOffset + 1}–{Math.min(listOffset + paginatedArticles.length, activeList.length)} of{' '}
                  {activeList.length}
                </span>
              </p>
              <button
                type="button"
                className="list-pagination__btn"
                disabled={listPage >= totalListPages}
                aria-label="Next page"
                onClick={() => setListPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
};

export default Writing;
