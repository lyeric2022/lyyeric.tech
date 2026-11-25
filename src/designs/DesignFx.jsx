import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'lyyeric-design';

export const DESIGNS = [
  {
    id: 'datamosh',
    num: '01',
    name: 'datamosh',
    title: 'Stale video blocks dragged by motion vectors',
  },
  {
    id: 'blob',
    num: '02',
    name: 'blob tracking',
    title: 'Boxes, ids, and links on regions the machine is following',
  },
  {
    id: 'flash',
    num: '03',
    name: 'flash light',
    title: 'Subject blown out to a white silhouette in a dark room',
  },
  {
    id: 'receipt',
    num: '04',
    name: 'receipt ticket',
    title: 'Narrow thermal receipt: mono type, torn edge, dithered picture',
  },
  {
    id: 'crt',
    num: '05',
    name: 'CRT',
    title: 'Scanlines, phosphor bloom, shadow mask, and a curved tube',
  },
  {
    id: 'onebit',
    num: '06',
    name: 'one bit dither',
    title: 'Black and white only, gray made from a Bayer dot pattern',
  },
  {
    id: 'pink',
    num: '07',
    name: 'pink phosphor',
    title: 'Magenta monochrome, deep black, fine raster, and bloom',
  },
];

const DESIGN_IDS = new Set(DESIGNS.map((design) => design.id));

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function bayerUri() {
  const rects = [];
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const value = Math.round((BAYER_8[y][x] / 64) * 255);
      rects.push(
        `<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${value},${value},${value})"/>`
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" shape-rendering="crispEdges">${rects.join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function receiptStamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(now.getMonth() + 1)}.${pad(now.getDate())}.${String(now.getFullYear()).slice(2)}  ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function readStoredMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return DESIGN_IDS.has(saved) ? saved : null;
  } catch {
    return null;
  }
}

function cornerPath(box) {
  const { x, y, w, h } = box;
  const leg = Math.max(4, Math.min(14, w / 5, h / 3));
  return [
    `M ${x} ${y + leg} V ${y} H ${x + leg}`,
    `M ${x + w - leg} ${y} H ${x + w} V ${y + leg}`,
    `M ${x + w} ${y + h - leg} V ${y + h} H ${x + w - leg}`,
    `M ${x + leg} ${y + h} H ${x} V ${y + h - leg}`,
  ].join(' ');
}

export default function DesignFx() {
  const { pathname } = useLocation();
  const [mode, setMode] = useState(readStoredMode);
  const [flashTick, setFlashTick] = useState(0);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (mode) root.dataset.fx = mode;
    else delete root.dataset.fx;
    root.style.setProperty('--fx-bayer', bayerUri());
    root.style.setProperty('--receipt-stamp', `"${receiptStamp()}"`);
    try {
      if (mode) localStorage.setItem(STORAGE_KEY, mode);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* private mode */
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'flash') return undefined;
    setFlashTick((tick) => tick + 1);
    return undefined;
  }, [mode]);

  const select = (id) => {
    setMode((current) => (current === id ? null : id));
  };

  return (
    <>
      <nav className="fx-switch" data-fx-ui aria-label="Design treatments">
        <button
          type="button"
          className="fx-switch__btn"
          aria-pressed={mode === null}
          onClick={() => setMode(null)}
        >
          <span className="fx-switch__num">00</span>
          <span className="fx-switch__name">site</span>
        </button>
        {DESIGNS.map((design) => (
          <button
            key={design.id}
            type="button"
            className="fx-switch__btn"
            aria-pressed={mode === design.id}
            title={design.title}
            onClick={() => select(design.id)}
          >
            <span className="fx-switch__num">{design.num}</span>
            <span className="fx-switch__name">{design.name}</span>
          </button>
        ))}
      </nav>

      {mode === 'datamosh' && <DatamoshLayer pathname={pathname} />}
      {mode === 'blob' && <BlobLayer pathname={pathname} />}
      {mode === 'flash' && <div key={flashTick} className="fx-flash" aria-hidden="true" />}
      {(mode === 'crt' || mode === 'pink') && (
        <div className={`fx-screen fx-screen--${mode}`} aria-hidden="true">
          <div className="fx-screen__mask" />
          <div className="fx-screen__scan" />
          <div className="fx-screen__grain" />
          <div className="fx-screen__vignette" />
        </div>
      )}
    </>
  );
}

function DatamoshLayer({ pathname }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slices = [];
    let placeTimer = 0;
    let rebuildTimer = 0;
    let tick = 0;

    const syncSlice = (entry, scrollY) => {
      const { slice, inner, top, height, dx, dy } = entry;
      slice.style.top = `${top}px`;
      slice.style.height = `${height}px`;
      slice.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      inner.style.transform = `translate3d(0, ${-(scrollY + top)}px, 0)`;
    };

    const place = (resolve) => {
      const scrollY = window.scrollY;
      const viewH = window.innerHeight;
      slices.forEach((entry, index) => {
        const keep = !resolve && Math.random() > 0.42;
        if (!keep) {
          const band = 10 + Math.floor(Math.random() * (resolve ? 18 : 34));
          entry.top = Math.max(0, Math.floor(Math.random() * (viewH - band)));
          entry.height = band;
          const reach = resolve || reduced ? 6 : 72;
          entry.dx = (Math.random() * 2 - 1) * reach;
          entry.dy = !resolve && Math.random() < 0.22 ? (Math.random() * 14 - 7) : 0;
          entry.slice.dataset.channel = ['r', 'g', 'b'][index % 3];
        }
        syncSlice(entry, scrollY);
      });
    };

    const build = () => {
      host.replaceChildren();
      slices.length = 0;
      const root = document.getElementById('root');
      if (!root) return;

      const clone = root.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      clone
        .querySelectorAll('[data-fx-ui], .datamosh-host, .blob-layer, .fx-screen, .fx-flash, script')
        .forEach((node) => node.remove());

      const count = reduced ? 4 : 8;
      for (let index = 0; index < count; index += 1) {
        const slice = document.createElement('div');
        slice.className = 'datamosh-slice';
        const inner = document.createElement('div');
        inner.className = 'datamosh-slice__inner';
        inner.appendChild(clone.cloneNode(true));
        slice.appendChild(inner);
        host.appendChild(slice);
        slices.push({ slice, inner, top: 0, height: 16, dx: 0, dy: 0 });
      }
      place(true);
    };

    build();

    const onScroll = () => {
      const scrollY = window.scrollY;
      slices.forEach((entry) => syncSlice(entry, scrollY));
    };

    const scheduleRebuild = () => {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(build, 180);
    };

    if (!reduced) {
      placeTimer = window.setInterval(() => {
        tick += 1;
        place(tick % 9 === 0);
      }, 150);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', scheduleRebuild);

    const observer = new MutationObserver((records) => {
      const relevant = records.some((record) => {
        const node = record.target.nodeType === 1 ? record.target : record.target.parentElement;
        return node && !node.closest('.datamosh-host');
      });
      if (relevant) scheduleRebuild();
    });
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      window.clearInterval(placeTimer);
      window.clearTimeout(rebuildTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', scheduleRebuild);
      observer.disconnect();
      host.replaceChildren();
    };
  }, [pathname]);

  return <div className="datamosh-host" ref={hostRef} aria-hidden="true" inert="" />;
}

function BlobLayer({ pathname }) {
  const [frame, setFrame] = useState({ blobs: [], lines: [], cursor: null });
  const idsRef = useRef(new WeakMap());
  const nextId = useRef(1);
  const cursorRef = useRef(null);

  useEffect(() => {
    let raf = 0;

    const idFor = (node) => {
      const ids = idsRef.current;
      if (!ids.has(node)) {
        ids.set(node, nextId.current);
        nextId.current += 1;
      }
      return ids.get(node);
    };

    const measure = () => {
      raf = 0;
      const nodes = [...document.querySelectorAll(
        'h1, h2, .compact-intro > p, .writing-page p, .writing-header a, .article-title, .home-screen h2, img'
      )].filter((node) => {
        if (node.closest('[data-fx-ui], .datamosh-host, .resume-modal')) return false;
        const rect = node.getBoundingClientRect();
        return rect.width > 28 && rect.height > 12 && rect.bottom > 0 && rect.top < window.innerHeight;
      }).slice(0, 12);

      const blobs = nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          id: idFor(node),
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        };
      });

      const cursor = cursorRef.current;
      const points = blobs.map((blob) => ({
        ...blob,
        cx: blob.x + blob.w / 2,
        cy: blob.y + blob.h / 2,
      }));
      if (cursor) {
        points.push({ id: 0, x: cursor.x - 16, y: cursor.y - 16, w: 32, h: 32, cx: cursor.x, cy: cursor.y, cursor: true });
      }

      const ordered = [...points].sort((a, b) => a.cy - b.cy || a.cx - b.cx);
      const lines = [];
      for (let index = 1; index < ordered.length; index += 1) {
        lines.push({
          id: `${ordered[index - 1].id}-${ordered[index].id}`,
          x1: ordered[index - 1].cx,
          y1: ordered[index - 1].cy,
          x2: ordered[index].cx,
          y2: ordered[index].cy,
        });
      }

      setFrame({
        blobs: points,
        lines,
        cursor,
      });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };

    const onMove = (event) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onLeave = () => {
      cursorRef.current = null;
      schedule();
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      observer.disconnect();
    };
  }, [pathname]);

  const count = String(frame.blobs.filter((blob) => !blob.cursor).length).padStart(2, '0');
  const cursorLabel = frame.cursor
    ? `${Math.round(frame.cursor.x)},${Math.round(frame.cursor.y)}`
    : '----,----';

  return (
    <div className="blob-layer" aria-hidden="true">
      <svg className="blob-layer__svg">
        {frame.lines.map((line) => (
          <line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
        {frame.blobs.map((blob) => {
          const label = `${String(blob.id).padStart(2, '0')}  ${Math.round(blob.x)},${Math.round(blob.y)}  ${Math.round(blob.w)}×${Math.round(blob.h)}`;
          const labelY = blob.y < 16 ? blob.y + 11 : blob.y - 4;
          return (
            <g key={blob.cursor ? 'cursor' : blob.id}>
              <rect x={blob.x} y={blob.y} width={blob.w} height={blob.h} className="blob-layer__box" />
              <path d={cornerPath(blob)} className="blob-layer__corners" />
              <path
                d={`M ${blob.x + blob.w / 2 - 5} ${blob.y + blob.h / 2} H ${blob.x + blob.w / 2 + 5} M ${blob.x + blob.w / 2} ${blob.y + blob.h / 2 - 5} V ${blob.y + blob.h / 2 + 5}`}
                className="blob-layer__corners"
              />
              <text x={blob.x} y={labelY}>{label}</text>
            </g>
          );
        })}
      </svg>
      <div className="blob-readout">
        <span>TRK {count}</span>
        <span>XY {cursorLabel}</span>
        <span>LIVE</span>
      </div>
    </div>
  );
}
