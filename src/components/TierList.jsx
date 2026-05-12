import React, { useEffect, useMemo, useRef, useState } from 'react';
import './writing/Writing.scss';
import './TierList.scss';
import { shouldIgnoreListPaginationArrowKeys } from '../constants/listPagination';
import { SHOW_VIDEO_ESSAYS_RANKINGS } from '../constants/siteFlags';
import { useHeightBasedPageSize } from '../hooks/useHeightBasedPageSize';
import { usePrevious } from '../hooks/usePrevious';
import { slotUnderlineOrigin } from '../utils/navUnderlineOrigin';

/** Empty body → null. Valid JSON → object. Non‑JSON → throws with a clear hint (API down / HTML error page). */
async function readResponseJson(response) {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(
      `Save API returned non-JSON (HTTP ${response.status}). Start the API server on port 3001 (see api/server.js).`
    );
  }
}

function readTierListCache(storageKey) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Linear interpolate score between list indices i0 → i1. */
function interpScore(i, i0, s0, i1, s1) {
  if (i1 === i0) return s0;
  return s0 + ((s1 - s0) * (i - i0)) / (i1 - i0);
}

function clampTierScore(s, lo = 5, hi = 10) {
  return Math.min(hi, Math.max(lo, s));
}

/** First matching anchor wins longest `match` string first (avoids ambiguous substrings). */
function anchorScoreForItemName(name, anchorRatings) {
  const lower = name.toLowerCase();
  const sorted = [...anchorRatings].sort((a, b) => b.match.length - a.match.length);
  for (const { match, score } of sorted) {
    if (lower.includes(match.toLowerCase())) return score;
  }
  return null;
}

function isTierAnchorRow(name, anchorRatings) {
  return Boolean(anchorRatings?.length && anchorScoreForItemName(name, anchorRatings) !== null);
}

/** Knots at anchored rows + synthetic 10 at index 0 / 5 at last index when those rows are not anchored. */
function buildScoreKnots(items, anchorRatings, synthFirst = 10, synthLast = 5) {
  const n = items.length;
  if (n === 0) return [];

  const knotByIdx = new Map();
  items.forEach((item, idx) => {
    const s = anchorScoreForItemName(item.name, anchorRatings);
    if (s !== null) knotByIdx.set(idx, s);
  });

  if (!knotByIdx.has(0)) knotByIdx.set(0, synthFirst);
  if (!knotByIdx.has(n - 1)) knotByIdx.set(n - 1, synthLast);

  const knots = Array.from(knotByIdx, ([idx, score]) => ({ idx, score }));
  knots.sort((a, b) => a.idx - b.idx);
  return knots;
}

function scoreFromKnots(i, knots) {
  const k = knots;
  if (k.length === 0) return 10;
  if (k.length === 1) return k[0].score;

  if (i <= k[0].idx) {
    return clampTierScore(interpScore(i, k[0].idx, k[0].score, k[1].idx, k[1].score));
  }
  const last = k.length - 1;
  if (i >= k[last].idx) {
    return clampTierScore(
      interpScore(i, k[last - 1].idx, k[last - 1].score, k[last].idx, k[last].score)
    );
  }

  for (let j = 0; j < last; j++) {
    if (k[j].idx <= i && i <= k[j + 1].idx) {
      return interpScore(i, k[j].idx, k[j].score, k[j + 1].idx, k[j + 1].score);
    }
  }
  return interpScore(i, k[0].idx, k[0].score, k[1].idx, k[1].score);
}

/** Score from anchors + linear segments; falls back to 10→5 by rank when `anchorRatings` empty. */
function tierListScoreValue(index, total, items, anchorRatings) {
  if (total <= 1) {
    if (anchorRatings?.length && items[0]) {
      const fixed = anchorScoreForItemName(items[0].name, anchorRatings);
      if (fixed !== null) return fixed;
    }
    return 10;
  }
  if (!anchorRatings?.length) {
    return 10 - (5 * index) / (total - 1);
  }
  const knots = buildScoreKnots(items, anchorRatings);
  return scoreFromKnots(index, knots);
}

function formatTierScore(index, total, items, anchorRatings) {
  const v = tierListScoreValue(index, total, items, anchorRatings);
  const r = Math.round(v * 10) / 10;
  return r % 1 === 0 ? String(r) : r.toFixed(1);
}

/** Normalized grade t ∈ [0,1]: 0 = best (blue), 1 = worst (red); ramp blue→green→yellow→orange→red. */
function tierHueFromNormalizedGrade(t) {
  const clamped = Math.min(1, Math.max(0, t));
  /** Hue anchors along score worst-ness (matches stops at 0, ¼, ½, ¾, 1). */
  const stops = [
    { pos: 0, hue: 218 },
    { pos: 0.25, hue: 148 },
    { pos: 0.5, hue: 54 },
    { pos: 0.75, hue: 28 },
    { pos: 1, hue: 4 },
  ];

  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (clamped <= b.pos) {
      const span = b.pos - a.pos || 1;
      const u = (clamped - a.pos) / span;
      return Math.round(a.hue + u * (b.hue - a.hue));
    }
  }
  return stops[stops.length - 1].hue;
}

/** Hue from numeric score (5–10): high → blue, low → red (matches the number). */
function tierRatingHue(index, total, items, anchorRatings) {
  const score = clampTierScore(tierListScoreValue(index, total, items, anchorRatings));
  const t = (10 - score) / 5;
  return tierHueFromNormalizedGrade(t);
}

/** Normalized film vs series for display (supports legacy rows without `mediaKind`). */
function tierItemMediaKind(item) {
  if (item.mediaKind === 'film' || item.mediaKind === 'series') {
    return item.mediaKind;
  }
  if (item.category === 'Shows' || item.category === 'Series') return 'series';
  return 'film';
}

/** Invisible grid cells so the last paginated page keeps the same height as full pages (pagination does not jump). */
function TierListPaginationPadRows({ count, page, sectionTabId, showEditOptions }) {
  if (count <= 0) return null;
  return (
    <>
      {Array.from({ length: count }, (_, padIdx) => (
        <li
          key={`tier-list-pad-${sectionTabId}-${page}-${padIdx}`}
          className="places-list__slot--empty"
          aria-hidden="true"
        >
          <span className="place-name">{'\u200b'}</span>
          <div className="place-row-end">
            <span className="place-score">{'\u200b'}</span>
            {showEditOptions ? (
              <div className="row-actions" aria-hidden>
                <button type="button" className="arrow-button" tabIndex={-1} disabled>
                  ↑
                </button>
                <button type="button" className="arrow-button" tabIndex={-1} disabled>
                  ↓
                </button>
                <button type="button" className="edit-link" tabIndex={-1} disabled>
                  edit
                </button>
                <button type="button" className="delete-link" tabIndex={-1} disabled>
                  delete
                </button>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </>
  );
}

const TierListSection = ({
  sectionTabId,
  title,
  placeholder,
  fetchPath,
  storageKey,
  saveEndpoint,
  exportFileName,
  showEditOptions,
  isActive,
  onActivate,
  anchorRatings,
}) => {
  const [items, setItems] = useState(() => readTierListCache(storageKey));
  const [fetchFinished, setFetchFinished] = useState(false);
  const [page, setPage] = useState(1);
  const [newItemName, setNewItemName] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMediaKind, setAddMediaKind] = useState('film');
  const [addSeason, setAddSeason] = useState('');
  const [addCategory, setAddCategory] = useState('Video Essays');
  const [addExtraAttributes, setAddExtraAttributes] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef(null);
  const addModalInputRef = useRef(null);
  const listRef = useRef(null);

  const pageSize = useHeightBasedPageSize(listRef, ':scope > li', {
    enabled: isActive && items.length > 0,
    layout: 'tier-grid',
    singleColumn: showEditOptions,
    bottomReserve: 132,
    deps: [isActive, items.length, showEditOptions],
  });

  useEffect(() => {
    if (!isActive) setAddModalOpen(false);
  }, [isActive]);

  useEffect(() => {
    if (!showEditOptions) setAddModalOpen(false);
  }, [showEditOptions]);

  useEffect(() => {
    if (!addModalOpen || !isActive) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setAddModalOpen(false);
        setNewItemName('');
        setAddMediaKind('film');
        setAddSeason('');
        setAddCategory('Video Essays');
        setAddExtraAttributes('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addModalOpen, isActive]);

  useEffect(() => {
    if (!addModalOpen || !showEditOptions) return undefined;
    setAddMediaKind('film');
    setAddSeason('');
    setAddCategory('Video Essays');
    setAddExtraAttributes('');
    const id = window.requestAnimationFrame(() => {
      addModalInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [addModalOpen, showEditOptions]);

  // Load network JSON (browser HTTP cache applies); localStorage hydrates initial state for instant paint.
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const response = await fetch(fetchPath);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && Array.isArray(data)) {
            setItems(data);
          }
          return;
        }
      } catch (error) {
        console.error(`Error loading ${title}:`, error);
      }

      if (!cancelled) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setItems(parsed);
          }
        } catch {
          /* ignore corrupt backup */
        }
      }
    };

    loadData().finally(() => {
      if (!cancelled) setFetchFinished(true);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPath, storageKey, title]);

  // Save to localStorage whenever items change (as backup)
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [items, storageKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [items.length, totalPages, pageSize]);

  useEffect(() => {
    if (selectedIndex === null || items.length === 0) return;
    const safeIdx = Math.min(selectedIndex, items.length - 1);
    const neededPage = Math.floor(safeIdx / pageSize) + 1;
    setPage((prev) => (prev !== neededPage ? neededPage : prev));
  }, [selectedIndex, items.length, pageSize]);

  useEffect(() => {
    if (!showEditOptions) setSelectedIndex(null);
  }, [showEditOptions]);

  // Handle keyboard shortcuts (only in dev view on localhost and when section is active)
  useEffect(() => {
    if (!showEditOptions || !isActive || addModalOpen) return;

    const handleKeyDown = (e) => {
      if (items.length === 0) return;
      if (editingId !== null) return;

      if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIndex === null) {
          setSelectedIndex(items.length - 1);
        } else if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        }
      } else if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault();
        if (selectedIndex === null) {
          setSelectedIndex(0);
        } else if (selectedIndex < items.length - 1) {
          setSelectedIndex(selectedIndex + 1);
        }
      } else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIndex !== null && selectedIndex > 0) {
          const newItems = [...items];
          [newItems[selectedIndex - 1], newItems[selectedIndex]] =
            [newItems[selectedIndex], newItems[selectedIndex - 1]];
          setItems(newItems);
          setSelectedIndex(selectedIndex - 1);
        }
      } else if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedIndex !== null && selectedIndex < items.length - 1) {
          const newItems = [...items];
          [newItems[selectedIndex], newItems[selectedIndex + 1]] =
            [newItems[selectedIndex + 1], newItems[selectedIndex]];
          setItems(newItems);
          setSelectedIndex(selectedIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditOptions, isActive, selectedIndex, items, editingId, addModalOpen]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    let extrasParsed = {};
    if (addExtraAttributes.trim()) {
      try {
        const parsed = JSON.parse(addExtraAttributes.trim());
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          alert('Extra attributes must be a JSON object, for example {"season":"s1"}');
          return;
        }
        extrasParsed = parsed;
      } catch {
        alert('Extra attributes are not valid JSON.');
        return;
      }
    }

    const protectedKeys = new Set(['id', 'name', 'dateAdded']);
    const extrasSafe = Object.fromEntries(
      Object.entries(extrasParsed).filter(([key]) => !protectedKeys.has(key))
    );

    let base;
    if (sectionTabId === 'main') {
      const category = addMediaKind === 'series' ? 'Series' : 'Film';
      base = {
        id: Date.now(),
        name: newItemName.trim(),
        dateAdded: new Date().toISOString(),
        mediaKind: addMediaKind,
        category,
        ...(addSeason.trim() ? { season: addSeason.trim() } : {}),
      };
    } else {
      base = {
        id: Date.now(),
        name: newItemName.trim(),
        dateAdded: new Date().toISOString(),
        category: addCategory.trim() || 'Video Essays',
      };
    }

    const newItem = { ...extrasSafe, ...base };

    setItems((prev) => {
      const updated = [...prev, newItem];
      setSelectedIndex(updated.length - 1);
      setPage(Math.max(1, Math.ceil(updated.length / pageSize)));
      return updated;
    });
    setNewItemName('');
    setAddMediaKind('film');
    setAddSeason('');
    setAddCategory('Video Essays');
    setAddExtraAttributes('');
    setAddModalOpen(false);
    onActivate();
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setNewItemName('');
    setAddMediaKind('film');
    setAddSeason('');
    setAddCategory('Video Essays');
    setAddExtraAttributes('');
  };

  const deleteItem = (id) => {
    if (window.confirm('Delete this item?')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedIndex(null);
    }
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    onActivate();
    setEditingId(item.id);
    setEditName(item.name);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  };

  const saveEdit = (id) => {
    if (!editName.trim()) {
      cancelEdit();
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: editName.trim() } : item
      )
    );
    setEditingId(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const moveItemUp = (index, e) => {
    e.stopPropagation();
    if (index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] =
        [newItems[index], newItems[index - 1]];
      setItems(newItems);
      setSelectedIndex(index - 1);
      onActivate();
    }
  };

  const moveItemDown = (index, e) => {
    e.stopPropagation();
    if (index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] =
        [newItems[index + 1], newItems[index]];
      setItems(newItems);
      setSelectedIndex(index + 1);
      onActivate();
    }
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveToPublished = async () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));

      const response = await fetch(saveEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });

      const body = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(body?.error || body?.details || `Save failed (HTTP ${response.status})`);
      }

      alert('Saved successfully!');
      if (body && typeof body === 'object') {
        console.log('Save result:', body);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(`Error saving: ${error.message}`);
    }
  };

  const pageOffset = (page - 1) * pageSize;
  const visibleItems = items.slice(pageOffset, pageOffset + pageSize);
  const padRowCount =
    totalPages > 1 ? Math.max(0, pageSize - visibleItems.length) : 0;

  const goToPage = (nextPage) => {
    setPage(nextPage);
    setSelectedIndex(null);
  };

  useEffect(() => {
    if (!isActive || totalPages <= 1 || addModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (shouldIgnoreListPaginationArrowKeys(e.target)) return;
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
        setSelectedIndex(null);
      } else {
        e.preventDefault();
        setPage((p) => Math.min(totalPages, p + 1));
        setSelectedIndex(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, totalPages, addModalOpen]);

  return (
    <section
      id={`tier-panel-${sectionTabId}`}
      role="tabpanel"
      className={`tier-list-section ${isActive ? 'active' : ''}`}
      aria-labelledby={`tier-tab-${sectionTabId}`}
      hidden={!isActive}
      onMouseDown={onActivate}
    >
      {showEditOptions && (
        <div className="tier-list-subheader tier-list-subheader--tools">
          <div className="action-buttons">
            <button type="button" onClick={saveToPublished} className="save-link">
              save
            </button>
            <button type="button" onClick={exportToJSON} className="export-link">
              export json
            </button>
            <button
              type="button"
              className="export-link"
              onClick={() => {
                onActivate();
                setAddModalOpen(true);
              }}
            >
              add
            </button>
          </div>
        </div>
      )}

      {isActive &&
        (items.length > 0 ? (
        <>
        <ul
          ref={listRef}
          className={`places-list${showEditOptions ? ' places-list--interactive' : ''}`}
          style={{ '--tier-item-count': visibleItems.length }}
        >
          {visibleItems.map((item, localIndex) => {
            const index = pageOffset + localIndex;
            return (
            <li
              key={item.id}
              className={[
                showEditOptions && selectedIndex === index ? 'selected' : '',
                isTierAnchorRow(item.name, anchorRatings) ? 'places-list__item--anchor' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--tier-rank-h': tierRatingHue(index, items.length, items, anchorRatings) }}
              onClick={() => {
                onActivate();
                if (!showEditOptions || editingId === item.id) return;
                setSelectedIndex(index);
              }}
            >
              {editingId === item.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => saveEdit(item.id)}
                  onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                  className="edit-input"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="place-name">
                  {item.name}
                  {tierItemMediaKind(item) === 'series' && item.season ? (
                    <span className="place-season"> · {item.season}</span>
                  ) : null}
                </span>
              )}
              <div className="place-row-end">
                <span
                  className="place-score"
                  aria-label={`Score ${formatTierScore(index, items.length, items, anchorRatings)}`}
                >
                  {formatTierScore(index, items.length, items, anchorRatings)}
                </span>
                {showEditOptions && (
                  <div className="row-actions">
                    <button
                      className="arrow-button"
                      onClick={(e) => moveItemUp(index, e)}
                      disabled={index === 0 || editingId === item.id}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="arrow-button"
                      onClick={(e) => moveItemDown(index, e)}
                      disabled={index === items.length - 1 || editingId === item.id}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="edit-link"
                      onClick={(e) => startEdit(item, e)}
                      disabled={editingId === item.id}
                    >
                      edit
                    </button>
                    <button
                      className="delete-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      disabled={editingId === item.id}
                    >
                      delete
                    </button>
                  </div>
                )}
              </div>
            </li>
            );
          })}
          <TierListPaginationPadRows
            count={padRowCount}
            page={page}
            sectionTabId={sectionTabId}
            showEditOptions={showEditOptions}
          />
        </ul>
        {totalPages > 1 && (
          <nav
            className="list-pagination"
            aria-label={`${title}, page ${page} of ${totalPages}`}
          >
            <div className="list-pagination__inner">
              <button
                type="button"
                className="list-pagination__btn"
                disabled={page <= 1}
                aria-label="Previous page"
                onClick={() => goToPage(page - 1)}
              >
                Prev
              </button>
              <p className="list-pagination__meta">
                <span className="list-pagination__range">
                  {pageOffset + 1}–{Math.min(pageOffset + visibleItems.length, items.length)} of{' '}
                  {items.length}
                </span>
              </p>
              <button
                type="button"
                className="list-pagination__btn"
                disabled={page >= totalPages}
                aria-label="Next page"
                onClick={() => goToPage(page + 1)}
              >
                Next
              </button>
            </div>
          </nav>
        )}
        </>
      ) : !fetchFinished ? (
        <p className="tier-list-loading" role="status" aria-live="polite">
          Loading…
        </p>
      ) : (
        <p className="tier-list-empty">No items yet. Click add to create one.</p>
      ))}

      {showEditOptions && addModalOpen && isActive && (
        <div
          className="tier-add-modal-backdrop"
          role="presentation"
          onClick={closeAddModal}
        >
          <div
            className="tier-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`tier-add-modal-title-${sectionTabId}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={`tier-add-modal-title-${sectionTabId}`} className="tier-add-modal__title">
              Add to {title}
            </h2>
            <form onSubmit={handleAddItem}>
              <div className="tier-add-modal__field">
                <label className="tier-add-modal__label" htmlFor={`tier-add-name-${sectionTabId}`}>
                  Title
                </label>
                <input
                  id={`tier-add-name-${sectionTabId}`}
                  ref={addModalInputRef}
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={placeholder || 'Item name'}
                  autoComplete="off"
                  required
                />
              </div>

              {sectionTabId === 'main' ? (
                <>
                  <div className="tier-add-modal__field">
                    <label className="tier-add-modal__label" htmlFor={`tier-add-kind-${sectionTabId}`}>
                      Kind
                    </label>
                    <select
                      id={`tier-add-kind-${sectionTabId}`}
                      className="tier-add-modal__select"
                      value={addMediaKind}
                      onChange={(e) => setAddMediaKind(e.target.value)}
                    >
                      <option value="film">Film</option>
                      <option value="series">Series</option>
                    </select>
                  </div>
                  <div className="tier-add-modal__field">
                    <label className="tier-add-modal__label" htmlFor={`tier-add-season-${sectionTabId}`}>
                      Season <span className="tier-add-modal__optional">(optional)</span>
                    </label>
                    <input
                      id={`tier-add-season-${sectionTabId}`}
                      type="text"
                      value={addSeason}
                      onChange={(e) => setAddSeason(e.target.value)}
                      placeholder="e.g. s1 or s1–s2"
                      autoComplete="off"
                    />
                  </div>
                </>
              ) : (
                <div className="tier-add-modal__field">
                  <label className="tier-add-modal__label" htmlFor={`tier-add-category-${sectionTabId}`}>
                    Category
                  </label>
                  <input
                    id={`tier-add-category-${sectionTabId}`}
                    type="text"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    placeholder="Video Essays"
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="tier-add-modal__field">
                <label className="tier-add-modal__label" htmlFor={`tier-add-extra-${sectionTabId}`}>
                  Extra attributes <span className="tier-add-modal__optional">(JSON object, optional)</span>
                </label>
                <textarea
                  id={`tier-add-extra-${sectionTabId}`}
                  className="tier-add-modal__textarea"
                  value={addExtraAttributes}
                  onChange={(e) => setAddExtraAttributes(e.target.value)}
                  placeholder='{"notes":"…"}'
                  rows={3}
                  spellCheck={false}
                />
              </div>

              <div className="tier-add-modal__actions">
                <button type="button" className="export-link" onClick={closeAddModal}>
                  cancel
                </button>
                <button type="submit" className="save-link">
                  add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {items.length > 0 && showEditOptions && isActive && (
        <p className="help-text">
          Click an item to select it, then use ↑/↓ to navigate or Shift + ↑/↓ to reorder
        </p>
      )}
    </section>
  );
};

const TierList = () => {
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const [isDevView, setIsDevView] = useState(false);
  const showEditOptions = isLocalhost && isDevView;
  const [activeList, setActiveList] = useState('main');
  const prevActiveList = usePrevious(activeList);

  const sectionConfigs = useMemo(() => {
    const main = {
      key: 'main',
      title: 'Films & Shows',
      placeholder: 'Add film/show',
      fetchPath: '/tier_list_published.json',
      storageKey: 'tier_list_published',
      saveEndpoint: '/api/save-published',
      exportFileName: 'tier_list_published.json',
      anchorRatings: [
        { match: 'Way of Water', score: 10 },
        { match: 'Alice in Borderland', score: 5 },
        { match: 'Coco', score: 8 },
        { match: 'Castlevania', score: 9 },
        { match: 'Ragnarok the Animation', score: 7 },
      ],
    };
    const videoEssays = {
      key: 'videoEssays',
      title: 'Video Essays',
      placeholder: 'Add video essay',
      fetchPath: '/video_essays_published.json',
      storageKey: 'video_essays_published',
      saveEndpoint: '/api/save-video-essays',
      exportFileName: 'video_essays_published.json',
    };
    return SHOW_VIDEO_ESSAYS_RANKINGS ? [main, videoEssays] : [main];
  }, []);

  const tierTabKeys = useMemo(() => sectionConfigs.map((c) => c.key), [sectionConfigs]);

  useEffect(() => {
    setActiveList((current) =>
      tierTabKeys.includes(current) ? current : tierTabKeys[0]
    );
  }, [tierTabKeys]);

  const tierToIdx = tierTabKeys.indexOf(activeList);
  const tierFromIdx =
    prevActiveList === undefined ? tierToIdx : tierTabKeys.indexOf(prevActiveList);

  const noFocus = (e) => {
    if (e.button === 0) e.preventDefault();
  };

  return (
      <div className="writing-page tier-list-page">
        <div className="tier-list-toolbar">
          <div
            className="drafts-kind-toggle"
            role="tablist"
            aria-label="Rankings categories"
          >
            {sectionConfigs.map((config) => {
              const slotIdx = tierTabKeys.indexOf(config.key);
              return (
              <button
                key={config.key}
                type="button"
                role="tab"
                id={`tier-tab-${config.key}`}
                aria-selected={activeList === config.key}
                aria-controls={`tier-panel-${config.key}`}
                tabIndex={0}
                className={`drafts-kind-toggle__btn ${activeList === config.key ? 'is-active' : ''}`}
                data-underline-origin={slotUnderlineOrigin(tierFromIdx, tierToIdx, slotIdx)}
                onMouseDown={noFocus}
                onClick={() => setActiveList(config.key)}
              >
                {config.title}
              </button>
            );
            })}
          </div>
          {isLocalhost && (
            <div className="view-toggle">
              <button
                type="button"
                onClick={() => setIsDevView(!isDevView)}
                className={`toggle-button ${isDevView ? 'dev' : 'public'}`}
                title={isDevView ? 'Switch to public view' : 'Switch to dev view'}
              >
                {isDevView ? 'dev' : 'public'}
              </button>
            </div>
          )}
        </div>

        <div className="tier-list-sections">
          {sectionConfigs.map((config) => (
            <TierListSection
              key={config.key}
              sectionTabId={config.key}
              {...config}
              showEditOptions={showEditOptions}
              isActive={activeList === config.key}
              onActivate={() => setActiveList(config.key)}
            />
          ))}
        </div>
      </div>
  );
};

export default TierList;
