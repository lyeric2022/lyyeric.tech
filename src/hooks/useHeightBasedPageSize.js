import { useLayoutEffect, useState } from 'react';

/** Matches `.places-list` breakpoint in TierList.scss */
const TIER_GRID_MQ = '(min-width: 540px)';

function viewportHeightPx() {
  if (typeof window === 'undefined') return 0;
  const vv = window.visualViewport;
  return vv?.height ?? window.innerHeight;
}

/**
 * Vertical distance between stacked rows: handles multi-column grids where DOM order is row-major.
 */
function measureRowStride(root, rowSelector, cols) {
  const rows = root.querySelectorAll(rowSelector);
  if (!rows.length) return null;

  const rect = (el) => el.getBoundingClientRect();
  const h0 = rect(rows[0]).height;

  if (cols > 1 && rows.length > cols) {
    const delta = rect(rows[cols]).top - rect(rows[0]).top;
    if (delta > 3) return Math.max(delta, h0);
  }

  if (rows.length >= 2) {
    const delta = rect(rows[1]).top - rect(rows[0]).top;
    if (delta > 3) return Math.max(delta, h0);
  }

  return h0 > 2 ? h0 : null;
}

/**
 * Items per page from viewport: rows that fit between list top and viewport bottom (minus reserve).
 * `layout: 'tier-grid'` uses 2 columns when `TIER_GRID_MQ` matches.
 *
 * Does not subscribe to window/visualViewport resize so browser zoom does not change page size;
 * remeasure runs when `enabled` / hook deps change or (tier-grid only) the column breakpoint changes.
 */
export function useHeightBasedPageSize(listRootRef, rowSelector, options = {}) {
  const {
    enabled = true,
    min = 4,
    max = 100,
    bottomReserve = 96,
    fallback = 14,
    layout = 'writing',
    /** When true, tier grid counts as one column (matches `.places-list--interactive` single-column layout). */
    singleColumn = false,
    /** Extra px added to usable height before dividing by row stride (subpixel / breathing room). */
    rowFitSlackPx = 14,
    deps = [],
  } = options;

  const [pageSize, setPageSize] = useState(fallback);

  useLayoutEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    let raf = 0;
    let cancelled = false;

    const columnCount = () => {
      if (singleColumn || layout !== 'tier-grid') return 1;
      return window.matchMedia(TIER_GRID_MQ).matches ? 2 : 1;
    };

    const measure = () => {
      const root = listRootRef.current;
      if (!root || cancelled) return;

      const rootRect = root.getBoundingClientRect();
      if (rootRect.height === 0 && rootRect.width === 0) return;

      const cols = Math.max(1, columnCount());
      const rowStride = measureRowStride(root, rowSelector, cols);
      if (!rowStride) {
        setPageSize((prev) => (prev !== fallback ? fallback : prev));
        return;
      }

      const vh = viewportHeightPx();
      const viewportBottom = vh - bottomReserve;
      const usable = viewportBottom - rootRect.top + rowFitSlackPx;

      if (usable <= rowStride) {
        setPageSize((prev) => (prev !== fallback ? fallback : prev));
        return;
      }

      const rowsThatFit = Math.floor(usable / rowStride);
      const raw = rowsThatFit * cols;
      const next = Math.min(max, Math.max(min, raw));

      setPageSize((prev) => (prev !== next ? next : prev));
    };

    measure();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!cancelled) measure();
    });

    const mq = layout === 'tier-grid' ? window.matchMedia(TIER_GRID_MQ) : null;
    const mqListener = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!cancelled) measure();
      });
    };
    mq?.addEventListener('change', mqListener);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      mq?.removeEventListener('change', mqListener);
    };
  }, [
    enabled,
    min,
    max,
    bottomReserve,
    fallback,
    rowSelector,
    layout,
    singleColumn,
    rowFitSlackPx,
    ...deps,
  ]);

  return pageSize;
}
